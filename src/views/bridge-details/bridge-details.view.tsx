import { FC, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BigNumber } from "ethers";

import useBridgeDetailsStyles from "src/views/bridge-details/bridge-details.styles";
import Chain from "src/views/bridge-details/components/chain/chain";
import Card from "src/views/shared/card/card.view";
import Header from "src/views/shared/header/header.view";
import Icon from "src/views/shared/icon/icon.view";
import Typography from "src/views/shared/typography/typography.view";
import Error from "src/views/shared/error/error.view";
import Button from "src/views/shared/button/button.view";
import PageLoader from "src/views/shared/page-loader/page-loader.view";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useErrorContext } from "src/contexts/error.context";
import { useEnvContext } from "src/contexts/env.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { parseError } from "src/adapters/error";
import { getCurrency } from "src/adapters/storage";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { getBridgeStatus, getChainName, getCurrencySymbol } from "src/utils/labels";
import { formatTokenAmount, formatFiatAmount, multiplyAmounts } from "src/utils/amounts";
import { calculateTransactionResponseFee } from "src/utils/fees";
import { deserializeBridgeId } from "src/utils/serializers";
import { Bridge } from "src/domain";
import routes from "src/routes";
import { FIAT_DISPLAY_PRECISION, getEtherToken } from "src/constants";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import { useTokensContext } from "src/contexts/tokens.context";

interface Fees {
  step1?: BigNumber;
  step2?: BigNumber;
}

const calculateFees = (bridge: Bridge): Promise<Fees> => {
  const step1Promise = bridge.from.provider
    .getTransaction(bridge.depositTxHash)
    .then((txResponse) => {
      return txResponse ? calculateTransactionResponseFee(txResponse) : undefined;
    })
    .catch(() => undefined);

  const step2Promise =
    bridge.status === "completed"
      ? bridge.to.provider
          .getTransaction(bridge.claimTxHash)
          .then((txResponse) => {
            return txResponse ? calculateTransactionResponseFee(txResponse) : undefined;
          })
          .catch(() => undefined)
      : Promise.resolve(undefined);

  return Promise.all([step1Promise, step2Promise]).then(([step1, step2]) => ({
    step1,
    step2,
  }));
};

const BridgeDetails: FC = () => {
  const callIfMounted = useCallIfMounted();
  const { bridgeId } = useParams();
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { claim, getBridge } = useBridgeContext();
  const { tokens } = useTokensContext();
  const { account, connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const [incorrectNetworkMessage, setIncorrectNetworkMessage] = useState<string>();
  const [bridge, setBridge] = useState<AsyncTask<Bridge, string>>({
    status: "pending",
  });
  const [ethFees, setEthFees] = useState<Fees>({});
  const [fiatFees, setFiatFees] = useState<Fees>({});
  const [fiatAmount, setFiatAmount] = useState<BigNumber>();
  const [isFinaliseButtonDisabled, setIsFinaliseButtonDisabled] = useState<boolean>(false);
  const currencySymbol = getCurrencySymbol(getCurrency());

  const classes = useBridgeDetailsStyles({
    status: bridge.status === "successful" ? bridge.data.status : undefined,
  });

  const onClaim = () => {
    if (bridge.status === "successful" && bridge.data.status === "on-hold") {
      setIsFinaliseButtonDisabled(true);
      claim({ bridge: bridge.data })
        .then(() => {
          navigate(routes.activity.path);
        })
        .catch((error) => {
          callIfMounted(() => {
            setIsFinaliseButtonDisabled(false);
            if (isMetamaskUserRejectedRequestError(error) === false) {
              void parseError(error).then((parsed) => {
                if (parsed === "wrong-network") {
                  setIncorrectNetworkMessage(
                    `Switch to ${getChainName(bridge.data.to)} to continue`
                  );
                } else {
                  notifyError(error);
                }
              });
            }
          });
        });
    }
  };

  useEffect(() => {
    if (bridge.status === "successful") {
      if (bridge.data.to.chainId === connectedProvider?.chainId) {
        setIncorrectNetworkMessage(undefined);
      }
    }
  }, [connectedProvider, bridge]);

  useEffect(() => {
    if (env && account.status === "successful") {
      const parsedBridgeId = deserializeBridgeId(bridgeId);
      if (parsedBridgeId.success) {
        const { depositCount, networkId } = parsedBridgeId.data;
        void getBridge({
          env,
          depositCount,
          networkId,
        })
          .then((bridge) => {
            callIfMounted(() => {
              setBridge({
                status: "successful",
                data: bridge,
              });
            });
          })
          .catch((error) => {
            callIfMounted(() => {
              notifyError(error);
              setBridge({
                status: "failed",
                error: "Bridge not found",
              });
            });
          });
      } else {
        callIfMounted(() => {
          notifyError(parsedBridgeId.error);
          setBridge({
            status: "failed",
            error: "Bridge not found",
          });
        });
      }
    }
  }, [account, env, bridgeId, notifyError, getBridge, callIfMounted]);

  useEffect(() => {
    if (bridge.status === "successful") {
      calculateFees(bridge.data)
        .then((ethFees) => {
          callIfMounted(() => {
            setEthFees(ethFees);
          });
        })
        .catch((error) => {
          callIfMounted(() => {
            notifyError(error);
          });
        });
    }
  }, [bridge, notifyError, callIfMounted]);

  useEffect(() => {
    if (env !== undefined && bridge.status === "successful") {
      const { amount, from, token } = bridge.data;

      // fiat amount
      getTokenPrice({ token, chain: from })
        .then((tokenPrice) => {
          callIfMounted(() => {
            setFiatAmount(
              multiplyAmounts(
                {
                  value: tokenPrice,
                  precision: FIAT_DISPLAY_PRECISION,
                },
                {
                  value: amount,
                  precision: token.decimals,
                },
                FIAT_DISPLAY_PRECISION
              )
            );
          });
        })
        .catch(() =>
          callIfMounted(() => {
            setFiatAmount(undefined);
          })
        );
    }
  }, [env, bridge, getTokenPrice, callIfMounted]);

  useEffect(() => {
    if (env !== undefined && bridge.status === "successful") {
      const { from } = bridge.data;

      // fiat fees
      const token = tokens?.find((t) => t.symbol === "WETH");
      if (token) {
        getTokenPrice({ token, chain: from })
          .then((tokenPrice) => {
            callIfMounted(() => {
              setFiatFees({
                step1: ethFees.step1
                  ? multiplyAmounts(
                      {
                        value: tokenPrice,
                        precision: FIAT_DISPLAY_PRECISION,
                      },
                      {
                        value: ethFees.step1,
                        precision: token.decimals,
                      },
                      FIAT_DISPLAY_PRECISION
                    )
                  : undefined,
                step2: ethFees.step2
                  ? multiplyAmounts(
                      {
                        value: tokenPrice,
                        precision: FIAT_DISPLAY_PRECISION,
                      },
                      {
                        value: ethFees.step2,
                        precision: token.decimals,
                      },
                      FIAT_DISPLAY_PRECISION
                    )
                  : undefined,
              });
            });
          })
          .catch(() =>
            callIfMounted(() => {
              setFiatFees({});
            })
          );
      }
    }
  }, [env, bridge, ethFees, getTokenPrice, callIfMounted, tokens]);

  switch (bridge.status) {
    case "pending":
    case "loading":
    case "reloading": {
      return (
        <>
          <Header title="Bridge Details" backTo={{ routeKey: "activity" }} />
          <PageLoader />
        </>
      );
    }
    case "failed": {
      return <Navigate to={routes.activity.path} replace />;
    }
    case "successful": {
      const { status, amount, from, to, token, depositTxHash } = bridge.data;

      const bridgeTxUrl = `${from.explorerUrl}/tx/${depositTxHash}`;
      const claimTxUrl =
        bridge.data.status === "completed"
          ? `${to.explorerUrl}/tx/${bridge.data.claimTxHash}`
          : undefined;

      const { step1: step1EthFee, step2: step2EthFee } = ethFees;
      const { step1: step1FiatFee, step2: step2FiatFee } = fiatFees;

      const ethToken = getEtherToken(from);

      if (env === undefined) {
        return null;
      }

      const tokenAmountString = `${formatTokenAmount(amount, token)} ${token.symbol}`;

      const fiatAmountString = `${currencySymbol}${
        fiatAmount ? formatFiatAmount(fiatAmount) : "--"
      }`;

      const step1FeeString = `${
        step1EthFee ? formatTokenAmount(step1EthFee, ethToken) : "--"
      } ETH ~ ${currencySymbol}${step1FiatFee ? formatFiatAmount(step1FiatFee) : "--"}`;

      const step2FeeString = `${
        step2EthFee ? formatTokenAmount(step2EthFee, ethToken) : "--"
      } ETH ~ ${currencySymbol}${step2FiatFee ? formatFiatAmount(step2FiatFee) : "--"}`;

      return (
        <div className={classes.contentWrapper}>
          <Header title="Bridge Details" backTo={{ routeKey: "activity" }} />
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
            <div className={classes.row}>
              <Typography type="body2" className={classes.alignRow}>
                Step 1 Fee ({getChainName(bridge.data.from)})
              </Typography>
              <Typography type="body1" className={classes.alignRow}>
                {step1FeeString}
              </Typography>
            </div>
            {bridge.data.status === "completed" && (
              <div className={classes.row}>
                <Typography type="body2" className={classes.alignRow}>
                  Step 2 Fee ({getChainName(bridge.data.to)})
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
              <a
                href={bridgeTxUrl}
                target="_blank"
                className={classes.explorerButton}
                rel="noreferrer"
              >
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
              <Button
                onClick={onClaim}
                disabled={status === "initiated" || isFinaliseButtonDisabled}
              >
                Finalise
              </Button>
              {incorrectNetworkMessage && <Error error={incorrectNetworkMessage} />}
            </div>
          )}
        </div>
      );
    }
  }
};

export default BridgeDetails;
