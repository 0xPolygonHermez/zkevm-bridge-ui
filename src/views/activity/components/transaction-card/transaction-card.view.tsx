import { FC } from "react";
import { formatEther } from "ethers/lib/utils";
import { useNavigate } from "react-router-dom";

import useTransactionCardStyles from "src/views/activity/components/transaction-card/transaction-card.styles";
import { ReactComponent as TransferL1Icon } from "src/assets/icons/l1-transfer.svg";
import { ReactComponent as TransferL2Icon } from "src/assets/icons/l2-transfer.svg";
import { ReactComponent as ReloadIcon } from "src/assets/icons/spinner.svg";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import routes from "src/routes";
import Icon from "src/views/shared/icon/icon.view";
import { Transaction, getTransactionStatusText } from "src/domain";

export interface TransactionCardProps {
  transaction: Transaction;
  onClaim: () => void;
}

const TransactionCard: FC<TransactionCardProps> = ({ transaction, onClaim }) => {
  const { status, destinationNetwork, depositCount, amount } = transaction;
  const classes = useTransactionCardStyles();
  const navigate = useNavigate();
  const LayerIcon =
    status !== "completed"
      ? ReloadIcon
      : destinationNetwork.key === "ethereum"
      ? TransferL1Icon
      : TransferL2Icon;
  const actionText = destinationNetwork.key === "ethereum" ? "Transfer to L1" : "Transfer to L2";
  const id = `${destinationNetwork.networkId}-${depositCount}`;

  return (
    <Card
      className={classes.card}
      onClick={() => navigate(`${routes.transactionDetails.path.split(":")[0]}${id}`)}
    >
      {status === "initiated" && <p className={classes.steps}>STEP 1/2</p>}
      {status === "on-hold" && <p className={classes.steps}>STEP 2/2</p>}
      <div className={classes.row}>
        <div className={classes.actionCircle}>
          <LayerIcon />
        </div>
        <div className={classes.actionColumn}>
          <Typography type="body1">{actionText}</Typography>
          <span
            className={`${classes.statusBox} ${status === "completed" ? classes.greenStatus : ""}`}
          >
            {getTransactionStatusText(status)}
          </span>
        </div>
        <div className={classes.tokenColumn}>
          <div className={classes.token}>
            <Icon url={transaction.token.logoURI} className={classes.tokenIcon} size={20} />
            <Typography type="body1">{formatEther(amount)} ETH</Typography>
          </div>
        </div>
      </div>
      {status === "initiated" && (
        <div className={classes.bottom}>
          <Typography type="body2">Step 2 will require signature</Typography>
          <button disabled className={classes.finalizeButton}>
            Finalize
          </button>
        </div>
      )}
      {status === "on-hold" && (
        <div className={classes.bottom}>
          <Typography type="body2">Signature required to finalize the transaction</Typography>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClaim();
            }}
            className={classes.finalizeButton}
          >
            Finalize
          </button>
        </div>
      )}
    </Card>
  );
};

export default TransactionCard;
