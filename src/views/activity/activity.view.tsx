import { useState, FC, useEffect } from "react";

import BridgeCard from "src/views/activity/components/bridge-card/bridge-card.view";
import useActivityStyles from "src/views/activity/activity.styles";
import Typography from "src/views/shared/typography/typography.view";
import Header from "src/views/shared/header/header.view";
import PageLoader from "src/views/shared/page-loader/page-loader.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { parseError } from "src/adapters/error";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { AUTO_REFRESH_RATE } from "src/constants";
import { Bridge } from "src/domain";
import useCallIfMounted from "src/hooks/use-call-if-mounted";

const Activity: FC = () => {
  const callIfMounted = useCallIfMounted();
  const env = useEnvContext();
  const { getBridges, claim } = useBridgeContext();
  const { account, connectedProvider } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const [bridgeList, setBridgeList] = useState<AsyncTask<Bridge[], undefined>>({
    status: "pending",
  });
  const [displayAll, setDisplayAll] = useState(true);
  const [wrongNetworkBridges, setWrongNetworkBridges] = useState<Bridge["id"][]>([]);
  const classes = useActivityStyles({ displayAll });

  const onDisplayAll = () => setDisplayAll(true);
  const onDisplayPending = () => setDisplayAll(false);

  const onClaim = (bridge: Bridge) => {
    if (bridge.status === "on-hold") {
      const { deposit, merkleProof } = bridge;
      claim({
        deposit,
        merkleProof,
      }).catch((error) => {
        if (isMetamaskUserRejectedRequestError(error) === false) {
          void parseError(error).then((parsed) => {
            if (parsed === "wrong-network") {
              callIfMounted(() => {
                setWrongNetworkBridges([...wrongNetworkBridges, bridge.id]);
              });
            } else {
              callIfMounted(() => {
                notifyError(error);
              });
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    if (env && account.status === "successful") {
      const loadBridges = () => {
        getBridges({ env, ethereumAddress: account.data })
          .then((bridges) => {
            callIfMounted(() => {
              setBridgeList({ status: "successful", data: bridges });
            });
          })
          .catch((error) => {
            callIfMounted(() => {
              setBridgeList({
                status: "failed",
                error: undefined,
              });
              notifyError(error);
            });
          });
      };
      const intervalId = setInterval(loadBridges, AUTO_REFRESH_RATE);
      loadBridges();

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [account, env, getBridges, notifyError, callIfMounted]);

  useEffect(() => {
    setWrongNetworkBridges([]);
  }, [connectedProvider?.chainId]);

  const EmptyMessage = () => <div className={classes.emptyMessage}>No Bridges found</div>;

  switch (bridgeList.status) {
    case "pending":
    case "loading":
    case "reloading": {
      return (
        <>
          <Header title="Activity" backTo="home" />
          <PageLoader />
        </>
      );
    }
    case "failed": {
      return (
        <>
          <Header title="Activity" backTo="home" />
          <EmptyMessage />
        </>
      );
    }
    case "successful": {
      const pendingBridges = bridgeList.data.filter((bridge) => bridge.status !== "completed");
      const filteredList = displayAll ? bridgeList.data : pendingBridges;

      return (
        <>
          <Header title="Activity" backTo="home" />
          <div className={classes.selectorBoxes}>
            <div className={`${classes.selectorBox} ${classes.allBox}`} onClick={onDisplayAll}>
              <Typography type="body1" className={classes.status}>
                All
              </Typography>
              <Typography type="body2" className={classes.numberAllBox}>
                {bridgeList.data.length}
              </Typography>
            </div>
            <div
              className={`${classes.selectorBox} ${classes.pendingBox}`}
              onClick={onDisplayPending}
            >
              <Typography type="body1" className={classes.status}>
                Pending
              </Typography>
              <Typography type="body2" className={classes.numberPendingBox}>
                {pendingBridges.length}
              </Typography>
            </div>
          </div>
          {filteredList.length ? (
            filteredList.map((bridge) => (
              <BridgeCard
                bridge={bridge}
                onClaim={() => onClaim(bridge)}
                networkError={wrongNetworkBridges.includes(bridge.id)}
                key={bridge.id}
              />
            ))
          ) : (
            <EmptyMessage />
          )}
        </>
      );
    }
  }
};

export default Activity;
