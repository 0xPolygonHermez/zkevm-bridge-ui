import { FC } from "react";

import useTransactionCardStyles from "src/views/activity/components/transaction-card/transaction-card.styles";
import { ReactComponent as TransferL1Icon } from "src/assets/icons/l1-transfer.svg";
import { ReactComponent as TransferL2Icon } from "src/assets/icons/l2-transfer.svg";
import { ReactComponent as ReloadIcon } from "src/assets/icons/spinner.svg";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import { getTimeFromNow, TimeFromNowParams } from "src/utils/time";
import { convertTokenAmountToFiat } from "src/utils/amounts";
import { useNavigate } from "react-router-dom";
import routes from "src/routes";
import TokenIcon from "src/views/shared/token-icon/token-icon";

export const statusText = {
  "on-hold": "On Hold",
  initiated: "Initiated",
  processing: "Processing",
  failed: "Error",
  completed: "Completed",
};
export interface TransactionCardProps {
  type: "l1" | "l2";
  id: number;
  timestamp: TimeFromNowParams["timestamp"];
  token: "eth" | "dai";
  status: "processing" | "initiated" | "on-hold" | "completed" | "failed";
  amount: number;
}

const TransactionCard: FC<TransactionCardProps> = ({
  id,
  type,
  timestamp,
  token,
  amount,
  status,
}) => {
  const classes = useTransactionCardStyles();
  const navigate = useNavigate();
  const IconsLayer = {
    l1: TransferL1Icon,
    l2: TransferL2Icon,
  };
  const Icon = status !== "completed" && status !== "failed" ? ReloadIcon : IconsLayer[type];
  const actionText = type === "l1" ? "Transfer to L1" : "Transfer to L2";

  return (
    <Card
      className={classes.card}
      onClick={() => navigate(`${routes.transactionDetails.path.split(":")[0]}${id}`)}
    >
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
              {getTimeFromNow({ timestamp })} ago
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
            <TokenIcon token={token} className={classes.tokenIcon} />
            <Typography type="body1">
              {amount} {token.toUpperCase()}
            </Typography>
          </div>
          <Typography type="body2">{convertTokenAmountToFiat({ amount, token })}</Typography>
        </div>
      </div>
      {status === "initiated" && (
        <div className={classes.bottom}>
          <Typography type="body2">
            Step 2 will require signature in {getTimeFromNow({ timestamp })}.
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
