import { FC } from "react";
import { useNavigate } from "react-router-dom";

import useBridgeCardStyles from "src/views/activity/components/bridge-card/bridge-card.styles";
import { ReactComponent as BridgeL1Icon } from "src/assets/icons/l1-bridge.svg";
import { ReactComponent as BridgeL2Icon } from "src/assets/icons/l2-bridge.svg";
import { ReactComponent as ReloadIcon } from "src/assets/icons/spinner.svg";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import routes from "src/routes";
import Icon from "src/views/shared/icon/icon.view";
import Error from "src/views/shared/error/error.view";
import { Bridge } from "src/domain";
import { getChainName, getBridgeStatus, getCurrencySymbol } from "src/utils/labels";
import { formatTokenAmount, formatFiatAmount } from "src/utils/amounts";
import { getCurrency } from "src/adapters/storage";

export interface BridgeCardProps {
  bridge: Bridge;
  networkError: boolean;
  onClaim: () => void;
}

const BridgeCard: FC<BridgeCardProps> = ({ bridge, networkError, onClaim }) => {
  const {
    status,
    id,
    deposit: { to, amount, token, fiatAmount },
  } = bridge;
  const classes = useBridgeCardStyles();
  const navigate = useNavigate();

  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    onClaim();
  };

  const preferredCurrencySymbol = getCurrencySymbol(getCurrency());

  const tokenAmountString = `${formatTokenAmount(amount, token)} ${token.symbol}`;

  const fiatAmountString = `${preferredCurrencySymbol}${
    fiatAmount ? formatFiatAmount(fiatAmount) : "--"
  }`;

  return (
    <Card
      className={classes.card}
      onClick={() => navigate(`${routes.bridgeDetails.path.split(":")[0]}${id}`)}
    >
      {status === "initiated" && <p className={classes.steps}>STEP 1/2</p>}
      {status === "on-hold" && <p className={classes.steps}>STEP 2/2</p>}
      <div className={classes.row}>
        <div className={classes.actionCircle}>
          {status !== "completed" ? (
            <ReloadIcon />
          ) : to.key === "ethereum" ? (
            <BridgeL1Icon />
          ) : (
            <BridgeL2Icon />
          )}
        </div>
        <div className={classes.actionColumn}>
          <Typography type="body1">
            {to.key === "ethereum" ? "Bridge to L1" : "Bridge to L2"}
          </Typography>
          <span
            className={`${classes.statusBox} ${status === "completed" ? classes.greenStatus : ""}`}
          >
            {getBridgeStatus(status)}
          </span>
        </div>
        <div className={classes.tokenColumn}>
          <div className={classes.token}>
            <Icon url={token.logoURI} className={classes.tokenIcon} size={20} />
            <Typography type="body1">{tokenAmountString}</Typography>
          </div>
          <Typography type="body1" className={classes.fiat}>
            {fiatAmountString}
          </Typography>
        </div>
      </div>
      {status === "initiated" && (
        <div className={classes.bottom}>
          <Typography type="body2">Step 2 will require signature</Typography>
          <button disabled className={classes.finaliseButton}>
            Finalise
          </button>
        </div>
      )}
      {status === "on-hold" && (
        <div className={classes.bottom}>
          {networkError ? (
            <Error error={`Switch to ${getChainName(to)} to continue`} type="body2" />
          ) : (
            <Typography type="body2">Signature required to finalise the bridge</Typography>
          )}
          <button onClick={onClick} className={classes.finaliseButton}>
            Finalise
          </button>
        </div>
      )}
    </Card>
  );
};

export default BridgeCard;
