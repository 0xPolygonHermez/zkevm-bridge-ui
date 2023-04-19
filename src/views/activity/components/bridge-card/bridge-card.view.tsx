import { BigNumber } from "ethers";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBatchNumberOfL2Block } from "src/adapters/ethereum";
import { getCurrency } from "src/adapters/storage";
import { ReactComponent as BridgeL1Icon } from "src/assets/icons/l1-bridge.svg";
import { ReactComponent as BridgeL2Icon } from "src/assets/icons/l2-bridge.svg";
import { AsyncTask, Bridge, Env, PendingBridge } from "src/domain";
import { routes } from "src/routes";
import { formatFiatAmount, formatTokenAmount } from "src/utils/amounts";
import { getBridgeStatus, getCurrencySymbol } from "src/utils/labels";
import { isAsyncTaskDataAvailable } from "src/utils/types";
import { useBridgeCardStyles } from "src/views/activity/components/bridge-card/bridge-card.styles";
import { Card } from "src/views/shared/card/card.view";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { Icon } from "src/views/shared/icon/icon.view";
import { Typography } from "src/views/shared/typography/typography.view";

export interface BridgeCardProps {
  bridge: Bridge;
  env: Env;
  isFinaliseDisabled: boolean;
  lastVerifiedBatch: AsyncTask<BigNumber, string>;
  networkError: boolean;
  onClaim?: () => void;
  showFiatAmount: boolean;
}

export const BridgeCard: FC<BridgeCardProps> = ({
  bridge,
  env,
  isFinaliseDisabled,
  lastVerifiedBatch,
  networkError,
  onClaim,
  showFiatAmount,
}) => {
  const { amount, fiatAmount, from, status, to, token } = bridge;
  const classes = useBridgeCardStyles();
  const navigate = useNavigate();
  const [batchNumberOfL2Block, setBatchNumberOfL2Block] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });

  const [blockNumber, fromKey] =
    bridge.status !== "pending" ? [bridge.blockNumber, bridge.from.key] : [undefined, undefined];

  useEffect(() => {
    if (status === "initiated" && fromKey === "polygon-zkevm") {
      setBatchNumberOfL2Block((currentBatchNumberOfL2Block) =>
        isAsyncTaskDataAvailable(currentBatchNumberOfL2Block)
          ? { data: currentBatchNumberOfL2Block.data, status: "reloading" }
          : { status: "loading" }
      );
      getBatchNumberOfL2Block(env.chains[1].provider, blockNumber)
        .then((newBatchNumberOfL2Block) => {
          setBatchNumberOfL2Block({
            data: newBatchNumberOfL2Block,
            status: "successful",
          });
        })
        .catch(() => {
          setBatchNumberOfL2Block({
            error: "An error occurred getting the batch number of the L2 block",
            status: "failed",
          });
        });
    }
  }, [blockNumber, env, fromKey, status]);

  const onClaimButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (onClaim) {
      onClaim();
    }
  };

  const onCardClick = (bridge: Exclude<Bridge, PendingBridge>) => {
    navigate(`${routes.bridgeDetails.path.split(":")[0]}${bridge.id}`);
  };

  const preferredCurrencySymbol = getCurrencySymbol(getCurrency());

  const tokenAmountString = `${formatTokenAmount(amount, token)} ${token.symbol}`;

  const fiatAmountString = showFiatAmount
    ? `${preferredCurrencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`
    : undefined;

  const remainingBatchesMsg: string = (() => {
    if (
      isAsyncTaskDataAvailable(lastVerifiedBatch) &&
      isAsyncTaskDataAvailable(batchNumberOfL2Block)
    ) {
      return `Waiting for validity proof. Tx will be confirmed in ${Math.max(
        batchNumberOfL2Block.data.sub(lastVerifiedBatch.data).toNumber(),
        0
      )} batches`;
    } else if (lastVerifiedBatch.status === "failed" || batchNumberOfL2Block.status === "failed") {
      return "Waiting for validity proof. This may take between 15 min and 1 hour";
    } else {
      return "Waiting for validity proof";
    }
  })();

  const BridgeAmount = (
    <div className={classes.token}>
      <Icon className={classes.tokenIcon} isRounded size={20} url={token.logoURI} />
      <Typography type="body1">{tokenAmountString}</Typography>
    </div>
  );

  const BridgeIcon = to.key === "ethereum" ? <BridgeL1Icon /> : <BridgeL2Icon />;

  const BridgeLabel = (
    <Typography className={classes.label} type="body1">
      {to.key === "ethereum" ? "Bridge to L1" : "Bridge to L2"}
    </Typography>
  );

  const BridgeStatus = (
    <span
      className={`${classes.statusBox} ${
        status === "completed" ? classes.greenStatus : classes.pendingStatus
      }`}
    >
      {getBridgeStatus(status, from)}
    </span>
  );

  const FiatAmount = (
    <Typography className={classes.fiat} type="body1">
      {fiatAmountString}
    </Typography>
  );

  switch (bridge.status) {
    case "pending": {
      return (
        <Card className={classes.card}>
          <div className={classes.top}>
            <div className={classes.infoContainer}>
              <div className={classes.circle}>{BridgeIcon}</div>
              <div className={classes.info}>
                <div className={classes.row}>
                  {BridgeLabel}
                  {fiatAmountString && BridgeAmount}
                </div>
                <div className={classes.row}>
                  {BridgeStatus}
                  {fiatAmountString && FiatAmount}
                </div>
              </div>
              {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
            </div>
          </div>
        </Card>
      );
    }
    case "initiated": {
      if (bridge.from.key === "ethereum") {
        return (
          <Card className={classes.card} onClick={() => onCardClick(bridge)}>
            <div className={classes.top}>
              <div className={classes.infoContainer}>
                <div className={classes.circle}>{BridgeIcon}</div>
                <div className={classes.info}>
                  <div className={classes.row}>
                    {BridgeLabel}
                    {fiatAmountString && BridgeAmount}
                  </div>
                  <div className={classes.row}>
                    {BridgeStatus}
                    {fiatAmountString && FiatAmount}
                  </div>
                </div>
                {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
              </div>
            </div>
          </Card>
        );
      } else {
        return (
          <Card className={classes.card} onClick={() => onCardClick(bridge)}>
            <div className={classes.top}>
              <div className={classes.row}>
                <p className={classes.steps}>STEP 1/2</p>
              </div>
              <div className={classes.infoContainer}>
                <div className={classes.circle}>{BridgeIcon}</div>
                <div className={classes.info}>
                  <div className={classes.row}>
                    {BridgeLabel}
                    {fiatAmountString && BridgeAmount}
                  </div>
                  <div className={classes.row}>
                    {BridgeStatus}
                    {fiatAmountString && FiatAmount}
                  </div>
                </div>
                {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
              </div>
            </div>
            <div className={classes.bottom}>
              <Typography type="body2">{remainingBatchesMsg}</Typography>
              <button className={classes.finaliseButton} disabled>
                Finalise
              </button>
            </div>
          </Card>
        );
      }
    }
    case "on-hold": {
      if (bridge.from.key === "ethereum") {
        return (
          <Card className={classes.card} onClick={() => onCardClick(bridge)}>
            <div className={classes.top}>
              <div className={classes.infoContainer}>
                <div className={classes.circle}>{BridgeIcon}</div>
                <div className={classes.info}>
                  <div className={classes.row}>
                    {BridgeLabel}
                    {fiatAmountString && BridgeAmount}
                  </div>
                  <div className={classes.row}>
                    {BridgeStatus}
                    {fiatAmountString && FiatAmount}
                  </div>
                </div>
                {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
              </div>
            </div>
          </Card>
        );
      } else {
        return (
          <Card className={classes.card} onClick={() => onCardClick(bridge)}>
            <div className={classes.top}>
              <div className={classes.row}>
                <p className={classes.steps}>STEP 2/2</p>
              </div>
              <div className={classes.infoContainer}>
                <div className={classes.circle}>{BridgeIcon}</div>
                <div className={classes.info}>
                  <div className={classes.row}>
                    {BridgeLabel}
                    {fiatAmountString && BridgeAmount}
                  </div>
                  <div className={classes.row}>
                    {BridgeStatus}
                    {fiatAmountString && FiatAmount}
                  </div>
                </div>
                {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
              </div>
            </div>
            <div className={classes.bottom}>
              {networkError ? (
                <ErrorMessage error={`Switch to ${to.name} to continue`} type="body2" />
              ) : (
                <Typography type="body2">Signature required to finalise the bridge</Typography>
              )}
              <button
                className={classes.finaliseButton}
                disabled={isFinaliseDisabled}
                onClick={onClaimButtonClick}
              >
                Finalise
              </button>
            </div>
          </Card>
        );
      }
    }
    case "completed": {
      return (
        <Card className={classes.card} onClick={() => onCardClick(bridge)}>
          <div className={classes.top}>
            <div className={classes.infoContainer}>
              <div className={classes.circle}>{BridgeIcon}</div>
              <div className={classes.info}>
                <div className={classes.row}>
                  {BridgeLabel}
                  {fiatAmountString && BridgeAmount}
                </div>
                <div className={classes.row}>
                  {BridgeStatus}
                  {fiatAmountString && FiatAmount}
                </div>
              </div>
              {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
            </div>
          </div>
        </Card>
      );
    }
  }
};
