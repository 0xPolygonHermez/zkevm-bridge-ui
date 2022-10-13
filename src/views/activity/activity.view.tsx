import { useState, FC, useEffect, useCallback, useRef } from "react";

import InfiniteScroll from "src/views/activity/components/infinite-scroll/infinite-scroll.view";
import Card from "src/views/shared/card/card.view";
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
import { AsyncTask, isMetaMaskUserRejectedRequestError } from "src/utils/types";
import { AUTO_REFRESH_RATE, PAGE_SIZE } from "src/constants";
import { Bridge } from "src/domain";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import useIntersection from "src/hooks/use-intersection";

const Activity: FC = () => {
  const callIfMounted = useCallIfMounted();
  const env = useEnvContext();
  const { fetchBridges, getPendingBridges, claim } = useBridgeContext();
  const { account, connectedProvider } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const { openSnackbar } = useUIContext();
  const [bridgeList, setBridgeList] = useState<AsyncTask<Bridge[], undefined, true>>({
    status: "pending",
  });
  const [displayAll, setDisplayAll] = useState(true);
  const [lastLoadedItem, setLastLoadedItem] = useState(0);
  const [total, setTotal] = useState(0);
  const [wrongNetworkBridges, setWrongNetworkBridges] = useState<string[]>([]);
  const [areBridgesDisabled, setAreBridgesDisabled] = useState<boolean>(false);
  const classes = useActivityStyles({ displayAll });

  const headerBorderObserved = useRef<HTMLDivElement>(null);
  const headerBorderTarget = useRef<HTMLDivElement>(null);

  useIntersection({
    observed: headerBorderObserved,
    target: headerBorderTarget,
    className: classes.stickyContentBorder,
  });

  const onDisplayAll = () => setDisplayAll(true);
  const onDisplayPending = () => setDisplayAll(false);

  const onClaim = (bridge: Bridge) => {
    if (bridge.status === "on-hold") {
      setAreBridgesDisabled(true);
      claim({
        bridge,
      })
        .then(() => {
          if (
            bridgeList.status === "successful" ||
            bridgeList.status === "reloading" ||
            bridgeList.status === "loading-more-items"
          ) {
            processFetchBridgesSuccess(bridgeList.data);
          }
          openSnackbar({
            type: "success-msg",
            text: "Transaction successfully submitted.",
          });
        })
        .catch((error) => {
          if (isMetaMaskUserRejectedRequestError(error) === false) {
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
        })
        .finally(() => {
          setAreBridgesDisabled(false);
        });
    }
  };

  const processFetchBridgesSuccess = useCallback(
    (bridges: Bridge[]) => {
      void getPendingBridges(bridges).then((pendingBridges) => {
        callIfMounted(() => {
          const filteredApiBridges = bridges.filter((bridge) => {
            const isBridgePresentInPendingBridges =
              (bridge.status === "pending" || bridge.status === "on-hold") &&
              pendingBridges.find(
                (pendingBridge) => pendingBridge.depositTxHash === bridge.depositTxHash
              ) !== undefined;
            return isBridgePresentInPendingBridges ? false : true;
          });
          setLastLoadedItem(bridges.length);
          setBridgeList({ status: "successful", data: [...pendingBridges, ...filteredApiBridges] });
        });
      });
    },
    [getPendingBridges, callIfMounted]
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
      setBridgeList({ status: "loading-more-items", data: bridgeList.data });
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

  const EmptyMessage = () => (
    <Card className={classes.emptyMessage}>
      {displayAll
        ? "Bridge activity will be shown here"
        : "There are no pending bridges at the moment"}
    </Card>
  );

  const Tabs = ({ all, pending }: { all: number; pending: number }) => (
    <div className={classes.selectorBoxes}>
      <div className={`${classes.selectorBox} ${classes.allBox}`} onClick={onDisplayAll}>
        <Typography type="body1" className={classes.status}>
          All
        </Typography>
        <Typography type="body2" className={classes.numberAllBox}>
          {all}
        </Typography>
      </div>
      <div className={`${classes.selectorBox} ${classes.pendingBox}`} onClick={onDisplayPending}>
        <Typography type="body1" className={classes.status}>
          Pending
        </Typography>
        <Typography type="body2" className={classes.numberPendingBox}>
          {pending}
        </Typography>
      </div>
    </div>
  );

  return (() => {
    switch (bridgeList.status) {
      case "pending":
      case "loading": {
        return (
          <div className={classes.contentWrapper}>
            <Header title="Activity" backTo={{ routeKey: "home" }} />
            <Tabs all={0} pending={0} />
            <PageLoader />
          </div>
        );
      }
      case "failed": {
        return (
          <div className={classes.contentWrapper}>
            <Header title="Activity" backTo={{ routeKey: "home" }} />
            <Tabs all={0} pending={0} />
            <EmptyMessage />
          </div>
        );
      }
      case "successful":
      case "loading-more-items":
      case "reloading": {
        const pendingBridges = bridgeList.data.filter((bridge) => bridge.status === "pending");
        const filteredList = displayAll ? bridgeList.data : pendingBridges;

        return (
          <>
            <div ref={headerBorderObserved}></div>
            <div className={classes.stickyContent} ref={headerBorderTarget}>
              <div className={classes.contentWrapper}>
                <Header title="Activity" backTo={{ routeKey: "home" }} />
                <Tabs all={bridgeList.data.length} pending={pendingBridges.length} />
              </div>
            </div>
            <div className={classes.contentWrapper}>
              {filteredList.length ? (
                <InfiniteScroll
                  isLoading={bridgeList.status === "loading-more-items"}
                  onLoadNextPage={onLoadNextPage}
                >
                  {filteredList.map((bridge) =>
                    bridge.status === "pending" ? (
                      <div
                        className={classes.bridgeCardwrapper}
                        key={bridge.depositTxHash || bridge.claimTxHash}
                      >
                        <BridgeCard
                          bridge={bridge}
                          networkError={false}
                          isFinaliseDisabled={true}
                          showFiatAmount={env !== undefined && env.fiatExchangeRates.areEnabled}
                        />
                      </div>
                    ) : (
                      <div className={classes.bridgeCardwrapper} key={bridge.id}>
                        <BridgeCard
                          bridge={bridge}
                          networkError={wrongNetworkBridges.includes(bridge.id)}
                          isFinaliseDisabled={areBridgesDisabled}
                          showFiatAmount={env !== undefined && env.fiatExchangeRates.areEnabled}
                          onClaim={() => onClaim(bridge)}
                        />
                      </div>
                    )
                  )}
                </InfiniteScroll>
              ) : (
                <EmptyMessage />
              )}
            </div>
          </>
        );
      }
    }
  })();
};

export default Activity;
