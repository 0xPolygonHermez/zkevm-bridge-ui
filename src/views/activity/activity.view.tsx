import { useState, FC, useEffect } from "react";

import BridgeCard from "src/views/activity/components/bridge-card/bridge-card.view";
import useActivityStyles from "src/views/activity/activity.styles";
import Typography from "src/views/shared/typography/typography.view";
import Header from "src/views/shared/header/header.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { parseError } from "src/adapters/error";
import { isMetamaskUserRejectedRequestError } from "src/utils/types";
import { AUTO_REFRESH_RATE } from "src/constants";
import { Bridge } from "src/domain";

const Activity: FC = () => {
  const env = useEnvContext();
  const { getBridges, claim } = useBridgeContext();
  const { account, connectedProvider } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const [bridgeList, setBridgeList] = useState<Bridge[]>([]);
  const [displayAll, setDisplayAll] = useState(true);
  const [wrongNetworkBridges, setWrongNetworkBridges] = useState<Bridge["id"][]>([]);
  const classes = useActivityStyles({ displayAll });

  const pendingBridges = bridgeList.filter((bridge) => bridge.status !== "completed");
  const filteredList = displayAll ? bridgeList : pendingBridges;

  const onDisplayAll = () => setDisplayAll(true);
  const onDisplayPending = () => setDisplayAll(false);

  const onClaim = (bridge: Bridge) => {
    if (bridge.status === "on-hold") {
      claim({
        token: bridge.deposit.token,
        amount: bridge.deposit.amount,
        destinationNetwork: bridge.deposit.destinationNetwork,
        destinationAddress: bridge.deposit.destinationAddress,
        index: bridge.deposit.depositCount,
        smtProof: bridge.merkleProof.merkleProof,
        globalExitRootNum: bridge.merkleProof.exitRootNumber,
        l2GlobalExitRootNum: bridge.merkleProof.l2ExitRootNumber,
        mainnetExitRoot: bridge.merkleProof.mainExitRoot,
        rollupExitRoot: bridge.merkleProof.rollupExitRoot,
      }).catch((error) => {
        if (isMetamaskUserRejectedRequestError(error) === false) {
          void parseError(error).then((parsed) => {
            if (parsed === "wrong-network") {
              setWrongNetworkBridges([...wrongNetworkBridges, bridge.id]);
            } else {
              notifyError(error);
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    if (env && account.status === "successful") {
      const loadBridges = () => {
        getBridges({ env, ethereumAddress: account.data }).then(setBridgeList).catch(notifyError);
      };
      const intervalId = setInterval(loadBridges, AUTO_REFRESH_RATE);
      loadBridges();

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [account, env, getBridges, notifyError]);

  useEffect(() => {
    setWrongNetworkBridges([]);
  }, [connectedProvider?.chainId]);

  return (
    <>
      <Header title="Activity" backTo="home" />
      <div className={classes.selectorBoxes}>
        <div className={`${classes.selectorBox} ${classes.allBox}`} onClick={onDisplayAll}>
          <Typography type="body1" className={classes.status}>
            All
          </Typography>
          <Typography type="body2" className={classes.numberAllBox}>
            {bridgeList.length}
          </Typography>
        </div>
        <div className={`${classes.selectorBox} ${classes.pendingBox}`} onClick={onDisplayPending}>
          <Typography type="body1" className={classes.status}>
            Pending
          </Typography>
          <Typography type="body2" className={classes.numberPendingBox}>
            {pendingBridges.length}
          </Typography>
        </div>
      </div>
      {filteredList.map((bridge) => (
        <BridgeCard
          bridge={bridge}
          onClaim={() => onClaim(bridge)}
          networkError={wrongNetworkBridges.includes(bridge.id)}
          key={bridge.id}
        />
      ))}
    </>
  );
};

export default Activity;
