import { FC } from "react";
import { useNavigate } from "react-router-dom";

import useBridgeCardStyles from "src/views/activity/components/bridge-card/bridge-card.styles";
import { ReactComponent as BridgeL1Icon } from "src/assets/icons/l1-bridge.svg";
import { ReactComponent as BridgeL2Icon } from "src/assets/icons/l2-bridge.svg";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import routes from "src/routes";
import Icon from "src/views/shared/icon/icon.view";
import ErrorMessage from "src/views/shared/error-message/error-message.view";
import { Bridge } from "src/domain";
import { getBridgeStatus, getCurrencySymbol } from "src/utils/labels";
import { formatTokenAmount, formatFiatAmount } from "src/utils/amounts";
import { getCurrency } from "src/adapters/storage";

export interface BridgeCardProps {
  bridge: Bridge;
  networkError: boolean;
  isFinaliseDisabled: boolean;
  showFiatAmount: boolean;
  onClaim?: () => void;
}

const BridgeCard: FC<BridgeCardProps> = ({
  bridge,
  networkError,
  showFiatAmount,
  isFinaliseDisabled,
  onClaim,
}) => {
  const { status, to, amount, token, fiatAmount } = bridge;
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
      <Icon url={token.logoURI} className={classes.tokenIcon} size={20} />
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
              <Typography type="body1" className={classes.label}>
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
                <Typography type="body1" className={classes.fiat}>
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
          <button disabled className={classes.finaliseButton}>
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
            disabled={isFinaliseDisabled}
            onClick={onClick}
            className={classes.finaliseButton}
          >
            Finalise
          </button>
        </div>
      )}
    </Card>
  );
};

export default BridgeCard;
