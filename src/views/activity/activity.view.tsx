import { BigNumber } from "ethers";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { isCancelRequestError } from "src/adapters/bridge-api";
import { parseError } from "src/adapters/error";
import { AUTO_REFRESH_RATE, PAGE_SIZE } from "src/constants";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { useUIContext } from "src/contexts/ui.context";
import { AsyncTask, Bridge, PendingBridge } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { useIntersection } from "src/hooks/use-intersection";
import { ProofOfEfficiency__factory } from "src/types/contracts/proof-of-efficiency";
import { isAsyncTaskDataAvailable, isMetaMaskUserRejectedRequestError } from "src/utils/types";
import { useActivityStyles } from "src/views/activity/activity.styles";
import { BridgeCard } from "src/views/activity/components/bridge-card/bridge-card.view";
import { InfiniteScroll } from "src/views/activity/components/infinite-scroll/infinite-scroll.view";
import { Card } from "src/views/shared/card/card.view";
import { Header } from "src/views/shared/header/header.view";
import { PageLoader } from "src/views/shared/page-loader/page-loader.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const Activity: FC = () => {
  const callIfMounted = useCallIfMounted();
  const env = useEnvContext();
  const { claim, fetchBridges, getPendingBridges } = useBridgeContext();
  const { connectedProvider } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const { openSnackbar } = useUIContext();
  const { tokens } = useTokensContext();
  const [lastVerifiedBatch, setLastVerifiedBatch] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });
  const [apiBridges, setApiBridges] = useState<AsyncTask<Bridge[], undefined, true>>({
    status: "pending",
  });
  const [pendingBridges, setPendingBridges] = useState<AsyncTask<PendingBridge[], undefined>>({
    status: "pending",
  });
  const [displayAll, setDisplayAll] = useState(true);
  const [lastLoadedItem, setLastLoadedItem] = useState(0);
  const [total, setTotal] = useState(0);
  const [wrongNetworkBridges, setWrongNetworkBridges] = useState<string[]>([]);
  const [areBridgesDisabled, setAreBridgesDisabled] = useState<boolean>(false);
  const classes = useActivityStyles();

  const fetchBridgesAbortController = useRef<AbortController>(new AbortController());

  const headerBorderObserved = useRef<HTMLDivElement>(null);
  const headerBorderTarget = useRef<HTMLDivElement>(null);

  useIntersection({
    className: classes.stickyContentBorder,
    observed: headerBorderObserved,
    target: headerBorderTarget,
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
          openSnackbar({
            text: "Transaction successfully submitted.",
            type: "success-msg",
          });
        })
        .catch((error) => {
          callIfMounted(() => {
            if (isMetaMaskUserRejectedRequestError(error) === false) {
              void parseError(error).then((parsed) => {
                if (parsed === "wrong-network") {
                  setWrongNetworkBridges([...wrongNetworkBridges, bridge.id]);
                } else {
                  notifyError(error);
                }
              });
            }
          });
        })
        .finally(() => {
          if (isAsyncTaskDataAvailable<Bridge[], undefined, true>(apiBridges)) {
            getPendingBridges(apiBridges.data)
              .then((data) => {
                callIfMounted(() => {
                  setPendingBridges({ data, status: "successful" });
                });
              })
              .catch((error) => {
                callIfMounted(() => {
                  notifyError(error);
                });
              })
              .finally(() => setAreBridgesDisabled(false));
          }
        });
    }
  };

  const processFetchBridgesSuccess = useCallback(
    (bridges: Bridge[]) => {
      setLastLoadedItem(bridges.length);
      setApiBridges({ data: bridges, status: "successful" });
      getPendingBridges(bridges)
        .then((data) => {
          callIfMounted(() => {
            setPendingBridges({ data, status: "successful" });
          });
        })
        .catch((error) => {
          callIfMounted(() => {
            notifyError(error);
          });
        });
    },
    [callIfMounted, getPendingBridges, notifyError]
  );

  const processFetchBridgesError = useCallback(
    (error: unknown) => {
      callIfMounted(() => {
        if (!isCancelRequestError(error)) {
          setApiBridges({
            error: undefined,
            status: "failed",
          });
          notifyError(error);
        }
      });
    },
    [callIfMounted, notifyError]
  );

  const onLoadNextPage = () => {
    if (
      env &&
      isAsyncTaskDataAvailable(connectedProvider) &&
      apiBridges.status === "successful" &&
      apiBridges.data.length < total
    ) {
      setApiBridges({ data: apiBridges.data, status: "loading-more-items" });

      // A new page requested by the user cancels any other fetch in progress
      fetchBridgesAbortController.current.abort();

      fetchBridges({
        env,
        ethereumAddress: connectedProvider.data.account,
        quantity: lastLoadedItem + PAGE_SIZE,
        type: "reload",
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
    // Initial API load
    if (env && connectedProvider.status === "successful" && tokens) {
      fetchBridgesAbortController.current = new AbortController();
      fetchBridges({
        abortSignal: fetchBridgesAbortController.current.signal,
        env,
        ethereumAddress: connectedProvider.data.account,
        limit: PAGE_SIZE,
        offset: 0,
        type: "load",
      })
        .then(({ bridges, total }) => {
          callIfMounted(() => {
            processFetchBridgesSuccess(bridges);
            setTotal(total);
          });
        })
        .catch(processFetchBridgesError);
    }
    return () => {
      fetchBridgesAbortController.current.abort();
    };
  }, [
    connectedProvider,
    env,
    tokens,
    callIfMounted,
    fetchBridges,
    processFetchBridgesError,
    processFetchBridgesSuccess,
  ]);

  useEffect(() => {
    // Polling bridges
    if (
      env &&
      connectedProvider.status === "successful" &&
      (apiBridges.status === "successful" || apiBridges.status === "failed")
    ) {
      const refreshBridges = () => {
        setApiBridges(
          apiBridges.status === "successful"
            ? { data: apiBridges.data, status: "reloading" }
            : { status: "loading" }
        );
        fetchBridgesAbortController.current = new AbortController();
        fetchBridges({
          abortSignal: fetchBridgesAbortController.current.signal,
          env,
          ethereumAddress: connectedProvider.data.account,
          quantity: lastLoadedItem,
          type: "reload",
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
    connectedProvider,
    apiBridges,
    env,
    lastLoadedItem,
    fetchBridges,
    processFetchBridgesError,
    processFetchBridgesSuccess,
    callIfMounted,
  ]);

  useEffect(() => {
    // Polling lastVerifiedBatch
    if (env) {
      const ethereum = env.chains[0];
      const poeContract = ProofOfEfficiency__factory.connect(
        ethereum.poeContractAddress,
        ethereum.provider
      );
      const refreshLastVerifiedBatch = () => {
        setLastVerifiedBatch((currentLastVerifiedBatch) =>
          isAsyncTaskDataAvailable(currentLastVerifiedBatch)
            ? { data: currentLastVerifiedBatch.data, status: "reloading" }
            : { status: "loading" }
        );
        poeContract
          .lastVerifiedBatch()
          .then((newLastVerifiedBatch) => {
            setLastVerifiedBatch({
              data: newLastVerifiedBatch,
              status: "successful",
            });
          })
          .catch(() => {
            setLastVerifiedBatch({
              error: "An error occurred getting the last verified batch",
              status: "failed",
            });
          });
      };
      refreshLastVerifiedBatch();
      const intervalId = setInterval(refreshLastVerifiedBatch, AUTO_REFRESH_RATE);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [env]);

  useEffect(() => {
    setWrongNetworkBridges([]);
  }, [connectedProvider]);

  const mergeBridges = (apiBridges: Bridge[], pendingBridges: PendingBridge[]) => {
    return [
      ...pendingBridges.filter(
        (pendingBridge) =>
          apiBridges.find(
            (apiBridge) => pendingBridge.depositTxHash === apiBridge.depositTxHash
          ) === undefined
      ),
      ...apiBridges.reduce(
        (acc: Bridge[], curr: Bridge) => [
          ...acc,
          pendingBridges.find(
            (pendingBridge) => pendingBridge.depositTxHash === curr.depositTxHash
          ) || curr,
        ],
        []
      ),
    ];
  };

  const EmptyMessage = () => (
    <Card className={classes.emptyMessage}>
      {displayAll
        ? "Bridge activity will be shown here"
        : "There are no pending bridges at the moment"}
    </Card>
  );

  const Tabs = ({ all, pending }: { all: number; pending: number }) => (
    <div className={classes.filterBoxes}>
      <div
        className={`${classes.filterBox} ${displayAll ? classes.filterBoxSelected : ""}`}
        onClick={onDisplayAll}
      >
        <Typography className={classes.filterBoxLabel} type="body1">
          All
        </Typography>
        <Typography
          className={`${classes.filterNumberBox} ${
            displayAll ? classes.filterNumberBoxSelected : ""
          }`}
          type="body2"
        >
          {all}
        </Typography>
      </div>
      <div
        className={`${classes.filterBox} ${!displayAll ? classes.filterBoxSelected : ""}`}
        onClick={onDisplayPending}
      >
        <Typography className={classes.filterBoxLabel} type="body1">
          Pending
        </Typography>
        <Typography
          className={`${classes.filterNumberBox} ${
            !displayAll ? classes.filterNumberBoxSelected : ""
          }`}
          type="body2"
        >
          {pending}
        </Typography>
      </div>
    </div>
  );

  const loader = (
    <div className={classes.contentWrapper}>
      <Header backTo={{ routeKey: "home" }} title="Activity" />
      <Tabs all={0} pending={0} />
      <PageLoader />
    </div>
  );

  if (!env || !tokens || !isAsyncTaskDataAvailable(pendingBridges)) {
    return loader;
  }

  switch (apiBridges.status) {
    case "pending":
    case "loading": {
      return loader;
    }
    case "failed": {
      return (
        <div className={classes.contentWrapper}>
          <Header backTo={{ routeKey: "home" }} title="Activity" />
          <Tabs all={0} pending={0} />
          <EmptyMessage />
        </div>
      );
    }
    case "successful":
    case "loading-more-items":
    case "reloading": {
      const allBridges = mergeBridges(apiBridges.data, pendingBridges.data);
      const filteredList = displayAll ? allBridges : pendingBridges.data;

      return (
        <>
          <div ref={headerBorderObserved}></div>
          <div className={classes.stickyContent} ref={headerBorderTarget}>
            <div className={classes.contentWrapper}>
              <Header backTo={{ routeKey: "home" }} title="Activity" />
              <Tabs all={allBridges.length} pending={pendingBridges.data.length} />
            </div>
          </div>
          <div className={classes.contentWrapper}>
            {filteredList.length ? (
              <InfiniteScroll
                isLoading={apiBridges.status === "loading-more-items"}
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
                        env={env}
                        isFinaliseDisabled={true}
                        lastVerifiedBatch={lastVerifiedBatch}
                        networkError={false}
                        showFiatAmount={env !== undefined && env.fiatExchangeRates.areEnabled}
                      />
                    </div>
                  ) : (
                    <div className={classes.bridgeCardwrapper} key={bridge.id}>
                      <BridgeCard
                        bridge={bridge}
                        env={env}
                        isFinaliseDisabled={areBridgesDisabled}
                        lastVerifiedBatch={lastVerifiedBatch}
                        networkError={wrongNetworkBridges.includes(bridge.id)}
                        onClaim={() => onClaim(bridge)}
                        showFiatAmount={env !== undefined && env.fiatExchangeRates.areEnabled}
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
};
