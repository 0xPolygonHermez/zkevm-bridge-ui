import { BigNumber } from "ethers";
import { FC, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { isCancelRequestError } from "src/adapters/bridge-api";
import { parseError } from "src/adapters/error";
import { getTxFeePaid } from "src/adapters/ethereum";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";
import { getEtherToken } from "src/constants";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { AsyncTask, Bridge } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { routes } from "src/routes";
import { formatTokenAmount } from "src/utils/amounts";
import { getBridgeStatus } from "src/utils/labels";
import { deserializeBridgeId } from "src/utils/serializers";
import { isAsyncTaskDataAvailable, isMetaMaskUserRejectedRequestError } from "src/utils/types";
import { useBridgeDetailsStyles } from "src/views/bridge-details/bridge-details.styles";
import { Chain } from "src/views/bridge-details/components/chain/chain";
import { Button } from "src/views/shared/button/button.view";
import { Card } from "src/views/shared/card/card.view";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { Header } from "src/views/shared/header/header.view";
import { Icon } from "src/views/shared/icon/icon.view";
import { PageLoader } from "src/views/shared/page-loader/page-loader.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface Fees {
  step1?: BigNumber;
  step2?: BigNumber;
}

const calculateFees = (bridge: Bridge): Promise<Fees> => {
  const step1Promise = getTxFeePaid({ chain: bridge.from, txHash: bridge.depositTxHash });

  const step2Promise =
    bridge.status === "completed"
      ? getTxFeePaid({ chain: bridge.to, txHash: bridge.claimTxHash })
      : Promise.resolve(undefined);

  return Promise.all([step1Promise, step2Promise]).then(([step1, step2]) => ({
    step1,
    step2,
  }));
};

export const BridgeDetails: FC = () => {
  const callIfMounted = useCallIfMounted();
  const { bridgeId } = useParams();
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { claim, fetchBridge } = useBridgeContext();
  const { tokens } = useTokensContext();
  const { connectedProvider } = useProvidersContext();
  const [incorrectNetworkMessage, setIncorrectNetworkMessage] = useState<string>();
  const [bridge, setBridge] = useState<AsyncTask<Bridge, string>>({
    status: "pending",
  });
  const [ethFees, setEthFees] = useState<Fees>({});
  const [isFinaliseButtonDisabled, setIsFinaliseButtonDisabled] = useState<boolean>(false);
  const classes = useBridgeDetailsStyles();

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
            if (isMetaMaskUserRejectedRequestError(error) === false) {
              void parseError(error).then((parsed) => {
                if (parsed === "wrong-network") {
                  setIncorrectNetworkMessage(`Switch to ${bridge.data.to.name} to continue`);
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
    if (isAsyncTaskDataAvailable(bridge) && connectedProvider.status === "successful") {
      if (bridge.data.to.chainId === connectedProvider.data.chainId) {
        setIncorrectNetworkMessage(undefined);
      }
    }
  }, [connectedProvider, bridge]);

  useEffect(() => {
    if (env && connectedProvider.status === "successful" && tokens) {
      const abortController = new AbortController();
      const parsedBridgeId = deserializeBridgeId(bridgeId);
      if (parsedBridgeId.success) {
        const { depositCount, networkId } = parsedBridgeId.data;
        void fetchBridge({
          abortSignal: abortController.signal,
          depositCount,
          env,
          networkId,
        })
          .then((bridge) => {
            callIfMounted(() => {
              if (bridge.destinationAddress !== connectedProvider.data.account) {
                return navigate(routes.activity.path);
              }

              setBridge({
                data: bridge,
                status: "successful",
              });
            });
          })
          .catch((error) => {
            callIfMounted(() => {
              if (!isCancelRequestError(error)) {
                notifyError(error);
                setBridge({
                  error: "Bridge not found",
                  status: "failed",
                });
              }
            });
          });
      } else {
        callIfMounted(() => {
          notifyError(parsedBridgeId.error);
          setBridge({
            error: "Bridge not found",
            status: "failed",
          });
        });
      }
      return () => {
        abortController.abort();
      };
    }
  }, [env, tokens, bridgeId, connectedProvider, notifyError, fetchBridge, callIfMounted, navigate]);

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

  switch (bridge.status) {
    case "pending":
    case "loading":
    case "reloading": {
      return (
        <>
          <Header backTo={{ routeKey: "activity" }} title="Bridge Details" />
          <PageLoader />
        </>
      );
    }
    case "failed": {
      return <Navigate replace to={routes.activity.path} />;
    }
    case "successful": {
      const { amount, from, status, to, token } = bridge.data;
      const bridgeTxUrl = `${from.explorerUrl}/tx/${bridge.data.depositTxHash}`;
      const claimTxUrl =
        bridge.data.status === "completed"
          ? `${to.explorerUrl}/tx/${bridge.data.claimTxHash}`
          : undefined;
      const { step1: step1EthFee, step2: step2EthFee } = ethFees;
      const ethToken = getEtherToken(from);

      if (env === undefined) {
        return null;
      }

      const tokenAmountString = `${formatTokenAmount(amount, token)} ${token.symbol}`;
      const step1FeeString = `${step1EthFee ? formatTokenAmount(step1EthFee, ethToken) : "--"} ETH`;
      const step2FeeString = `${step2EthFee ? formatTokenAmount(step2EthFee, ethToken) : "--"} ETH`;
      const dotClass =
        bridge.status === "successful"
          ? bridge.data.status === "completed"
            ? classes.dotCompleted
            : bridge.data.status === "on-hold"
            ? classes.dotOnHold
            : classes.dotProcessing
          : "";

      return (
        <div className={classes.contentWrapper}>
          <Header backTo={{ routeKey: "activity" }} title="Bridge Details" />
          <Card className={classes.card}>
            <div className={classes.balance}>
              <Icon className={classes.tokenIcon} isRounded size={48} url={token.logoURI} />
              <Typography type="h1">{tokenAmountString}</Typography>
            </div>
            <div className={classes.row}>
              <Typography className={classes.alignRow} type="body2">
                Status
              </Typography>
              <Typography className={classes.alignRow} type="body1">
                <span className={dotClass} />
                {getBridgeStatus(status, from)}
              </Typography>
            </div>
            <div className={classes.row}>
              <Typography className={classes.alignRow} type="body2">
                From
              </Typography>
              <Chain chain={from} className={classes.alignRow} />
            </div>
            <div className={classes.row}>
              <Typography className={classes.alignRow} type="body2">
                To
              </Typography>
              <Chain chain={to} className={classes.alignRow} />
            </div>
            <div className={classes.row}>
              <Typography className={classes.alignRow} type="body2">
                Step 1 Fee ({bridge.data.from.name})
              </Typography>
              <Typography className={classes.alignRow} type="body1">
                {step1FeeString}
              </Typography>
            </div>
            {bridge.data.status === "completed" && (
              <div className={classes.row}>
                <Typography className={classes.alignRow} type="body2">
                  Step 2 Fee ({bridge.data.to.name})
                </Typography>
                <Typography className={classes.alignRow} type="body1">
                  {step2FeeString}
                </Typography>
              </div>
            )}
            <div className={classes.row}>
              <Typography className={classes.alignRow} type="body2">
                Track step 1 transaction
              </Typography>
              <a
                className={classes.explorerButton}
                href={bridgeTxUrl}
                rel="noreferrer"
                target="_blank"
              >
                <NewWindowIcon /> <Typography type="body1">View on explorer</Typography>
              </a>
            </div>
            {claimTxUrl && (
              <div className={`${classes.row} ${classes.lastRow}`}>
                <Typography className={classes.alignRow} type="body2">
                  Track step 2 transaction
                </Typography>
                <a
                  className={classes.explorerButton}
                  href={claimTxUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <NewWindowIcon /> <Typography type="body1">View on explorer</Typography>
                </a>
              </div>
            )}
          </Card>
          {(status === "initiated" || (status === "on-hold" && from.key === "polygon-zkevm")) && (
            <div className={classes.finaliseRow}>
              <Button
                disabled={status === "initiated" || isFinaliseButtonDisabled}
                onClick={onClaim}
              >
                Finalise
              </Button>
              {incorrectNetworkMessage && <ErrorMessage error={incorrectNetworkMessage} />}
            </div>
          )}
        </div>
      );
    }
  }
};
