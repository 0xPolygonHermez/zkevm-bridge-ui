import useTransactionCardStyles from "src/views/activity/components/transaction-card/transaction-card.styles";
import { ReactComponent as TransferL1Icon } from "src/assets/icons/l1-transfer.svg";
import { ReactComponent as TransferL2Icon } from "src/assets/icons/l2-transfer.svg";
import { ReactComponent as ReloadIcon } from "src/assets/icons/spinner.svg";
import { ReactComponent as EthToken } from "src/assets/tokens/eth.svg";
import { ReactComponent as DaiToken } from "src/assets/tokens/dai.svg";
import FiatAmount from "src/views/shared/fiatAmount/fiat-amount";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import timeAgo from "src/utils/time-ago";

export interface TransactionCardProps {
  type: "l1" | "l2";
  id: number;
  timestamp: number;
  token: "eth" | "dai";
  status: "processing" | "initiated" | "on-hold" | "completed" | "failed";
  amount: number;
}

const TransactionCard = ({ type, timestamp, token, amount, status }: TransactionCardProps) => {
  const classes = useTransactionCardStyles();
  const IconsLayer = {
    l1: TransferL1Icon,
    l2: TransferL2Icon,
  };
  const Icon = status !== "completed" && status !== "failed" ? ReloadIcon : IconsLayer[type];
  const actionText = type === "l1" ? "Transfer to L1" : "Transfer to L2";
  const statusText = {
    ["on-hold"]: "On Hold",
    initiated: "Initiate",
    processing: "Processing",
    failed: "Error",
  };
  const tokenIcons = {
    eth: EthToken,
    dai: DaiToken,
  };
  const TokenIcon = tokenIcons[token] || tokenIcons["eth"];

  return (
    <Card className={classes.card}>
      {status === "initiated" && <p className={classes.steps}>STEP 1/2</p>}
      {status === "on-hold" && <p className={classes.steps}>STEP 2/2</p>}
      <div className={classes.row}>
        <div className={classes.actionCircle}>
          <Icon />
        </div>
        <div className={classes.actionColumn}>
          <Typography type="body1">{actionText}</Typography>
          {status === "completed" ? (
            <Typography type="body2" className={classes.time}>
              {timeAgo(timestamp)} ago
            </Typography>
          ) : (
            <span
              className={`${classes.statusBox} ${
                status === "on-hold" || status === "failed" ? classes.redStatus : ""
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
      {status === "initiated" && (
        <div className={classes.bottom}>
          <Typography type="body2">
            Step 2 will require signature in {timeAgo(timestamp)}.
          </Typography>
          <button disabled className={classes.finaliseButton}>
            Finalise
          </button>
        </div>
      )}
      {status === "on-hold" && (
        <div className={classes.bottom}>
          <Typography type="body2">Sign required to finalise transaction.</Typography>
          <button className={classes.finaliseButton}>Finalise </button>
        </div>
      )}
    </Card>
  );
};

export default TransactionCard;
