import { FC } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrency } from "src/adapters/storage";
import { ReactComponent as BridgeL1Icon } from "src/assets/icons/l1-bridge.svg";
import { ReactComponent as BridgeL2Icon } from "src/assets/icons/l2-bridge.svg";
import { Bridge } from "src/domain";
import routes from "src/routes";
import { formatFiatAmount, formatTokenAmount } from "src/utils/amounts";
import { getBridgeStatus, getCurrencySymbol } from "src/utils/labels";
import useBridgeCardStyles from "src/views/activity/components/bridge-card/bridge-card.styles";
import Card from "src/views/shared/card/card.view";
import ErrorMessage from "src/views/shared/error-message/error-message.view";
import Icon from "src/views/shared/icon/icon.view";
import Typography from "src/views/shared/typography/typography.view";

export interface BridgeCardProps {
  bridge: Bridge;
  isFinaliseDisabled: boolean;
  networkError: boolean;
  onClaim?: () => void;
  showFiatAmount: boolean;
}

const BridgeCard: FC<BridgeCardProps> = ({
  bridge,
  isFinaliseDisabled,
  networkError,
  onClaim,
  showFiatAmount,
}) => {
  const { amount, fiatAmount, status, to, token } = bridge;
  const classes = useBridgeCardStyles();
  const navigate = useNavigate();

  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (onClaim) {
      onClaim();
    }
  };

  const preferredCurrencySymbol = getCurrencySymbol(getCurrency());

  const tokenAmountString = `${formatTokenAmount(amount, token)} ${token.symbol}`;

  const fiatAmountString = showFiatAmount
    ? `${preferredCurrencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`
    : undefined;

  const bridgeAmount = (
    <div className={classes.token}>
      <Icon className={classes.tokenIcon} size={20} url={token.logoURI} />
      <Typography type="body1">{tokenAmountString}</Typography>
    </div>
  );

  return (
    <Card
      className={classes.card}
      onClick={() => {
        if (bridge.status !== "pending") {
          navigate(`${routes.bridgeDetails.path.split(":")[0]}${bridge.id}`);
        }
      }}
    >
      <div className={classes.top}>
        <div className={classes.row}>
          {status === "initiated" && <p className={classes.steps}>STEP 1/2</p>}
          {status === "on-hold" && <p className={classes.steps}>STEP 2/2</p>}
        </div>
        <div className={classes.infoContainer}>
          <div className={classes.circle}>
            {to.key === "ethereum" ? <BridgeL1Icon /> : <BridgeL2Icon />}
          </div>
          <div className={classes.info}>
            <div className={classes.row}>
              <Typography className={classes.label} type="body1">
                {to.key === "ethereum" ? "Bridge to L1" : "Bridge to L2"}
              </Typography>
              {fiatAmountString && bridgeAmount}
            </div>
            <div className={classes.row}>
              <span
                className={`${classes.statusBox} ${
                  bridge.status === "pending"
                    ? classes.pendingStatus
                    : bridge.status === "completed"
                    ? classes.greenStatus
                    : ""
                }`}
              >
                {getBridgeStatus(status)}
              </span>
              {fiatAmountString && (
                <Typography className={classes.fiat} type="body1">
                  {fiatAmountString}
                </Typography>
              )}
            </div>
          </div>
          {!fiatAmountString && <div className={classes.amount}>{bridgeAmount}</div>}
        </div>
      </div>
      {status === "initiated" && (
        <div className={classes.bottom}>
          {bridge.from.key === "ethereum" ? (
            <Typography type="body2">Step 2 will require signature</Typography>
          ) : (
            <Typography type="body2">Waiting for validity proof</Typography>
          )}
          <button className={classes.finaliseButton} disabled>
            Finalise
          </button>
        </div>
      )}
      {status === "on-hold" && (
        <div className={classes.bottom}>
          {networkError ? (
            <ErrorMessage error={`Switch to ${to.name} to continue`} type="body2" />
          ) : (
            <Typography type="body2">Signature required to finalise the bridge</Typography>
          )}
          <button
            className={classes.finaliseButton}
            disabled={isFinaliseDisabled}
            onClick={onClick}
          >
            Finalise
          </button>
        </div>
      )}
    </Card>
  );
};

export default BridgeCard;
