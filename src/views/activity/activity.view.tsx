import { useState, FC, useEffect, useCallback } from "react";

import InfiniteScroll from "src/views/activity/components/infinite-scroll/infinite-scroll.view";
import BridgeCard from "src/views/activity/components/bridge-card/bridge-card.view";
import useActivityStyles from "src/views/activity/activity.styles";
import Typography from "src/views/shared/typography/typography.view";
import Header from "src/views/shared/header/header.view";
import PageLoader from "src/views/shared/page-loader/page-loader.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useUIContext } from "src/contexts/ui.context";
import { parseError } from "src/adapters/error";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { AUTO_REFRESH_RATE, PAGE_SIZE } from "src/constants";
import { Bridge } from "src/domain";
import useCallIfMounted from "src/hooks/use-call-if-mounted";

const Activity: FC = () => {
  const callIfMounted = useCallIfMounted();
  const env = useEnvContext();
  const { fetchBridges, claim } = useBridgeContext();
  const { account, connectedProvider } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const { openSnackbar } = useUIContext();
  const [bridgeList, setBridgeList] = useState<AsyncTask<Bridge[], undefined>>({
    status: "pending",
  });
  const [displayAll, setDisplayAll] = useState(true);
  const [lastLoadedItem, setLastLoadedItem] = useState(0);
  const [total, setTotal] = useState(0);
  const [wrongNetworkBridges, setWrongNetworkBridges] = useState<Bridge["id"][]>([]);
  const classes = useActivityStyles({ displayAll });

  const onDisplayAll = () => setDisplayAll(true);
  const onDisplayPending = () => setDisplayAll(false);

  const onClaim = (bridge: Bridge) => {
    if (bridge.status === "on-hold") {
      claim({
        bridge,
      })
        .then(() => {
          openSnackbar({
            type: "success-msg",
            text: "Transaction successfully submitted.\nThe list will be updated once it is processed.",
          });
        })
        .catch((error) => {
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

  const processFetchBridgesSuccess = useCallback(
    (bridges: Bridge[]) => {
      callIfMounted(() => {
        setLastLoadedItem(bridges.length);
        setBridgeList({ status: "successful", data: bridges });
      });
    },
    [callIfMounted]
  );

  const processFetchBridgesError = useCallback(
    (error: unknown) => {
      callIfMounted(() => {
        setBridgeList({
          status: "failed",
          error: undefined,
        });
        notifyError(error);
      });
    },
    [callIfMounted, notifyError]
  );

  const onLoadNextPage = () => {
    if (
      env &&
      account.status === "successful" &&
      bridgeList.status === "successful" &&
      bridgeList.data.length < total
    ) {
      setBridgeList({ status: "reloading", data: bridgeList.data });
      fetchBridges({
        type: "reload",
        env,
        ethereumAddress: account.data,
        quantity: lastLoadedItem + PAGE_SIZE,
      })
        .then(({ bridges, total }) => {
          callIfMounted(() => {
            processFetchBridgesSuccess(bridges);
            setTotal(total);
          });
        })
        .catch(processFetchBridgesError);
    }
  };

  useEffect(() => {
    if (env && account.status === "successful") {
      const loadBridges = () => {
        fetchBridges({
          type: "load",
          env,
          ethereumAddress: account.data,
          limit: PAGE_SIZE,
          offset: 0,
        })
          .then(({ bridges, total }) => {
            callIfMounted(() => {
              processFetchBridgesSuccess(bridges);
              setTotal(total);
            });
          })
          .catch(processFetchBridgesError);
      };
      loadBridges();
    }
  }, [
    account,
    env,
    callIfMounted,
    fetchBridges,
    processFetchBridgesError,
    processFetchBridgesSuccess,
  ]);

  useEffect(() => {
    if (
      env &&
      account.status === "successful" &&
      (bridgeList.status === "successful" || bridgeList.status === "failed")
    ) {
      const refreshBridges = () => {
        setBridgeList(
          bridgeList.status === "successful"
            ? { status: "reloading", data: bridgeList.data }
            : { status: "loading" }
        );
        fetchBridges({
          type: "reload",
          env,
          ethereumAddress: account.data,
          quantity: lastLoadedItem,
        })
          .then(({ bridges, total }) => {
            callIfMounted(() => {
              processFetchBridgesSuccess(bridges);
              setTotal(total);
            });
          })
          .catch(processFetchBridgesError);
      };
      const intervalId = setInterval(refreshBridges, AUTO_REFRESH_RATE);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [
    account,
    bridgeList,
    env,
    lastLoadedItem,
    fetchBridges,
    processFetchBridgesError,
    processFetchBridgesSuccess,
    callIfMounted,
  ]);

  useEffect(() => {
    setWrongNetworkBridges([]);
  }, [connectedProvider?.chainId]);

  const EmptyMessage = () => <div className={classes.emptyMessage}>No Bridges found</div>;

  return (() => {
    switch (bridgeList.status) {
      case "pending":
      case "loading": {
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
      case "successful":
      case "reloading": {
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
              <InfiniteScroll
                isLoading={bridgeList.status === "reloading"}
                onLoadNextPage={onLoadNextPage}
              >
                {filteredList.map((bridge) => (
                  <BridgeCard
                    bridge={bridge}
                    onClaim={() => onClaim(bridge)}
                    networkError={wrongNetworkBridges.includes(bridge.id)}
                    key={bridge.id}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <EmptyMessage />
            )}
          </>
        );
      }
    }
  })();
};

export default Activity;
