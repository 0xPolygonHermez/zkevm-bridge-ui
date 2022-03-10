import useTransactionCardStyles from "src/views/activity/components/transaction-card/transaction-card.styles";
import { ReactComponent as TransferL1Icon } from "src/assets/icons/transfer-l1.svg";
import { ReactComponent as TransferL2Icon } from "src/assets/icons/transfer-l2.svg";
import { ReactComponent as ReloadIcon } from "src/assets/icons/reload-card.svg";
import { ReactComponent as EthToken } from "src/assets/tokens/eth.svg";
import { ReactComponent as DaiToken } from "src/assets/tokens/dai.svg";
import FiatAmount from "src/views/shared/fiatAmount/fiat-amount";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";

export interface TransactionCardProps {
  type: "l1" | "l2";
  id: number;
  timestamp: number;
  token: "eth" | "dai";
  status: "hold" | "initiate" | "process" | "complete" | "error";
  amount: number;
}

const TrasnsactionCard = ({ type, timestamp, token, amount, status }: TransactionCardProps) => {
  const classes = useTransactionCardStyles();
  const IconsLayer = {
    l1: TransferL1Icon,
    l2: TransferL2Icon,
  };
  const Icon = status !== "complete" && status !== "error" ? ReloadIcon : IconsLayer[type];
  const actionText = type === "l1" ? "Transfer to L1" : "Transfer to L2";
  const statusText = {
    hold: "On Hold",
    initiate: "Initiate",
    process: "Processing",
    error: "Error",
  };
  const tokenIcons = {
    eth: EthToken,
    dai: DaiToken,
  };
  const TokenIcon = tokenIcons[token] || tokenIcons["eth"];

  const convertToTime = (): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(seconds / 86400);
      return `${days}d`;
    }
  };

  return (
    <Card className={classes.card}>
      {status === "initiate" && <p className={classes.steps}>STEP 1/2</p>}
      {status === "hold" && <p className={classes.steps}>STEP 2/2</p>}
      <div className={classes.row}>
        <div className={classes.actionCircle}>
          <Icon />
        </div>
        <div className={classes.actionColumn}>
          <Typography type="body1">{actionText}</Typography>
          {status === "complete" ? (
            <Typography type="body2" className={classes.time}>
              {convertToTime()} ago
            </Typography>
          ) : (
            <span
              className={`${classes.statusBox} ${
                status === "hold" || status === "error" ? classes.redStatus : ""
              }`}
            >
              {statusText[status]}
            </span>
          )}
        </div>
        <div className={classes.tokenColumn}>
          <div className={classes.token}>
            <TokenIcon className={classes.tokenIcon} />
            <Typography type="body1">
              {amount} {token.toUpperCase()}
            </Typography>
          </div>
          <Typography type="body2">
            <FiatAmount amount={amount} token={token} />
          </Typography>
        </div>
      </div>
      {status === "initiate" && (
        <div className={classes.bottom}>
          <Typography type="body2">Step 2 will require signature in {convertToTime()}.</Typography>
          <button disabled className={classes.finaliseButton}>
            Finalise
          </button>
        </div>
      )}
      {status === "hold" && (
        <div className={classes.bottom}>
          <Typography type="body2">Sign required to finalise transaction.</Typography>
          <button className={classes.finaliseButton}>Finalise </button>
        </div>
      )}
    </Card>
  );
};

export default TrasnsactionCard;
