import { FC, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BigNumber } from "ethers";

import useBridgeDetailsStyles from "src/views/bridge-details/bridge-details.styles";
import Card from "src/views/shared/card/card.view";
import Header from "src/views/shared/header/header.view";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { ReactComponent as SpinnerIcon } from "src/assets/icons/spinner.svg";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Chain from "src/views/bridge-details/components/chain/chain";
import Error from "src/views/shared/error/error.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useErrorContext } from "src/contexts/error.context";
import { useEnvContext } from "src/contexts/env.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { parseError } from "src/adapters/error";
import { getCurrency } from "src/adapters/storage";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { getBridgeStatus, getChainName, getCurrencySymbol } from "src/utils/labels";
import { formatTokenAmount, formatFiatAmount } from "src/utils/amounts";
import { calculateTransactionResponseFee } from "src/utils/fees";
import { Bridge } from "src/domain";
import routes from "src/routes";
import Button from "src/views/shared/button/button.view";
import { getChainTokens } from "src/constants";

interface Fees {
  step1?: BigNumber;
  step2?: BigNumber;
}

const calculateFees = (bridge: Bridge): Promise<Fees> => {
  const step1Promise = bridge.deposit.from.provider
    .getTransaction(bridge.deposit.txHash)
    .then(calculateTransactionResponseFee);

  const step2Promise =
    bridge.status === "completed"
      ? bridge.deposit.to.provider
          .getTransaction(bridge.claim.txHash)
          .then(calculateTransactionResponseFee)
      : Promise.resolve(undefined);

  return Promise.all([step1Promise, step2Promise]).then(([step1, step2]) => ({
    step1,
    step2,
  }));
};

const BridgeDetails: FC = () => {
  const { bridgeId } = useParams();
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { getBridges, claim } = useBridgeContext();
  const { account, connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const [incorrectNetworkMessage, setIncorrectNetworkMessage] = useState<string>();
  const [bridge, setBridge] = useState<AsyncTask<Bridge, string>>({
    status: "pending",
  });
  const [ethFees, setEthFees] = useState<Fees>({});
  const [fiatFees, setFiatFees] = useState<Fees>({});
  const [fiatAmount, setFiatAmount] = useState<BigNumber>();
  const currencySymbol = getCurrencySymbol(getCurrency());

  const classes = useBridgeDetailsStyles({
    status: bridge.status === "successful" ? bridge.data.status : undefined,
  });

  const onClaim = () => {
    if (bridge.status === "successful" && bridge.data.status === "on-hold") {
      const { deposit, merkleProof } = bridge.data;
      claim({
        deposit,
        merkleProof,
      })
        .then(() => {
          navigate(routes.activity.path);
        })
        .catch((error) => {
          if (isMetamaskUserRejectedRequestError(error) === false) {
            void parseError(error).then((parsed) => {
              if (parsed === "wrong-network") {
                setIncorrectNetworkMessage(`Switch to ${getChainName(deposit.to)} to continue`);
              } else {
                notifyError(error);
              }
            });
          }
        });
    }
  };

  useEffect(() => {
    if (bridge.status === "successful") {
      if (bridge.data.deposit.to.chainId === connectedProvider?.chainId) {
        setIncorrectNetworkMessage(undefined);
      }
    }
  }, [connectedProvider, bridge]);

  useEffect(() => {
    if (env && account.status === "successful") {
      // ToDo: Get all the data only for the right bridge
      void getBridges({ env, ethereumAddress: account.data })
        .then((bridges) => {
          const foundBridge = bridges.find((bridge) => {
            return bridge.id === bridgeId;
          });
          if (foundBridge) {
            setBridge({
              status: "successful",
              data: foundBridge,
            });
          } else {
            setBridge({
              status: "failed",
              error: "Bridge not found",
            });
          }
        })
        .catch(notifyError);
    }
  }, [account, env, bridgeId, notifyError, getBridges]);

  useEffect(() => {
    if (bridge.status === "successful") {
      calculateFees(bridge.data).then(setEthFees).catch(notifyError);
    }
  }, [bridge, notifyError]);

  useEffect(() => {
    if (bridge.status === "successful") {
      const {
        deposit: { amount, from: chain, token },
      } = bridge.data;

      // fiat amount
      getTokenPrice({ token, chain })
        .then((tokenPrice) => {
          setFiatAmount(tokenPrice.mul(amount));
        })
        .catch(() => setFiatAmount(undefined));

      // fiat fees
      const weth = getChainTokens(chain).find((t) => t.symbol === "WETH");
      if (weth) {
        getTokenPrice({ token: weth, chain: chain })
          .then((tokenPrice) => {
            setFiatFees({
              step1: ethFees.step1 ? tokenPrice.mul(ethFees.step1) : undefined,
              step2: ethFees.step2 ? tokenPrice.mul(ethFees.step2) : undefined,
            });
          })
          .catch(() => setFiatFees({}));
      }
    }
  }, [bridge, ethFees, getTokenPrice]);

  if (bridge.status === "pending" || bridge.status === "loading") {
    return <SpinnerIcon />;
  }

  if (bridge.status === "failed") {
    return <Navigate to={routes.activity.path} replace />;
  }

  const {
    status,
    deposit: { amount, from, to, token, txHash },
  } = bridge.data;

  const bridgeTxUrl = `${from.explorerUrl}/tx/${txHash}`;
  const claimTxUrl =
    bridge.data.status === "completed"
      ? `${to.explorerUrl}/tx/${bridge.data.claim.txHash}`
      : undefined;

  const { step1: step1EthFee, step2: step2EthFee } = ethFees;
  const { step1: step1FiatFee, step2: step2FiatFee } = fiatFees;

  const ethToken = getChainTokens(from).find((t) => t.symbol === "ETH");

  if (env === undefined || ethToken === undefined) {
    return null;
  }

  const tokenAmountString = `${formatTokenAmount(amount, token)} ${token.symbol}`;

  const fiatAmountString = `${currencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`;

  const step1FeeString = `${
    step1EthFee ? formatTokenAmount(step1EthFee, ethToken) : "--"
  } ETH ~ ${currencySymbol}${step1FiatFee ? formatFiatAmount(step1FiatFee) : "--"}`;

  const step2FeeString = `${
    step2EthFee ? formatTokenAmount(step2EthFee, ethToken) : "--"
  } ETH ~ ${currencySymbol}${step2FiatFee ? formatFiatAmount(step2FiatFee) : "--"}`;

  return (
    <>
      <Header title="Bridge Details" backTo="activity" />
      <Card className={classes.card}>
        <div className={classes.balance}>
          <Icon url={token.logoURI} className={classes.tokenIcon} size={48} />
          <Typography type="h1">{tokenAmountString}</Typography>
          <Typography type="h2" className={classes.fiat}>
            {fiatAmountString}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            Status
          </Typography>
          <Typography type="body1" className={classes.alignRow}>
            <span className={classes.dot} />
            {getBridgeStatus(status)}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            From
          </Typography>
          <Chain chain={from} className={classes.alignRow} />
        </div>
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            To
          </Typography>
          <Chain chain={to} className={classes.alignRow} />
        </div>
        {step1EthFee && (
          <div className={classes.row}>
            <Typography type="body2" className={classes.alignRow}>
              Step 1 Fee ({getChainName(bridge.data.deposit.from)})
            </Typography>
            <Typography type="body1" className={classes.alignRow}>
              {step1FeeString}
            </Typography>
          </div>
        )}
        {step2EthFee && (
          <div className={classes.row}>
            <Typography type="body2" className={classes.alignRow}>
              Step 2 Fee ({getChainName(bridge.data.deposit.to)})
            </Typography>
            <Typography type="body1" className={classes.alignRow}>
              {step2FeeString}
            </Typography>
          </div>
        )}
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            Track step 1 transaction
          </Typography>
          <a href={bridgeTxUrl} target="_blank" className={classes.explorerButton} rel="noreferrer">
            <NewWindowIcon /> <Typography type="body1">View on explorer</Typography>
          </a>
        </div>
        {claimTxUrl && (
          <div className={`${classes.row} ${classes.lastRow}`}>
            <Typography type="body2" className={classes.alignRow}>
              Track step 2 transaction
            </Typography>
            <a
              href={claimTxUrl}
              target="_blank"
              className={classes.explorerButton}
              rel="noreferrer"
            >
              <NewWindowIcon /> <Typography type="body1">View on explorer</Typography>
            </a>
          </div>
        )}
      </Card>
      {(status === "initiated" || status === "on-hold") && (
        <div className={classes.finaliseRow}>
          <Button onClick={onClaim} disabled={status === "initiated"}>
            Finalise
          </Button>
          {incorrectNetworkMessage && <Error error={incorrectNetworkMessage} />}
        </div>
      )}
    </>
  );
};

export default BridgeDetails;
