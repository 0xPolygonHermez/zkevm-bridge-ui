import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

import useTransactionCardStyles from "src/views/activity/components/transaction-card/transaction-card.styles";
import { ReactComponent as TransferL1Icon } from "src/assets/icons/l1-transfer.svg";
import { ReactComponent as TransferL2Icon } from "src/assets/icons/l2-transfer.svg";
import { ReactComponent as ReloadIcon } from "src/assets/icons/spinner.svg";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import routes from "src/routes";
import Icon from "src/views/shared/icon/icon.view";
import Error from "src/views/shared/error/error.view";
import { Transaction } from "src/domain";
import { getTransactionStatus } from "src/utils/labels";
import { formatTokenAmount } from "src/utils/amounts";

export interface TransactionCardProps {
  transaction: Transaction;
  onClaim: () => Promise<string | undefined>;
}

const TransactionCard: FC<TransactionCardProps> = ({ transaction, onClaim }) => {
  const {
    status,
    id,
    bridge: { destinationNetwork, amount, token },
  } = transaction;
  const classes = useTransactionCardStyles();
  const navigate = useNavigate();
  const [incorrectMessageNetwork, setIncorrectMessageNetwork] = useState<string>();

  const onClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    const error = await onClaim();
    setIncorrectMessageNetwork(error);
  };

  return (
    <Card
      className={classes.card}
      onClick={() => navigate(`${routes.transactionDetails.path.split(":")[0]}${id}`)}
    >
      {status === "initiated" && <p className={classes.steps}>STEP 1/2</p>}
      {status === "on-hold" && <p className={classes.steps}>STEP 2/2</p>}
      <div className={classes.row}>
        <div className={classes.actionCircle}>
          {status !== "completed" ? (
            <ReloadIcon />
          ) : destinationNetwork.key === "ethereum" ? (
            <TransferL1Icon />
          ) : (
            <TransferL2Icon />
          )}
        </div>
        <div className={classes.actionColumn}>
          <Typography type="body1">
            {destinationNetwork.key === "ethereum" ? "Transfer to L1" : "Transfer to L2"}
          </Typography>
          <span
            className={`${classes.statusBox} ${status === "completed" ? classes.greenStatus : ""}`}
          >
            {getTransactionStatus(status)}
          </span>
        </div>
        <div className={classes.tokenColumn}>
          <div className={classes.token}>
            <Icon url={token.logoURI} className={classes.tokenIcon} size={20} />
            <Typography type="body1">
              {`${formatTokenAmount(amount, token)} ${token.symbol}`}
            </Typography>
          </div>
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
          {incorrectMessageNetwork === undefined ? (
            <Typography type="body2">Signature required to finalise the transaction</Typography>
          ) : (
            <Error error={incorrectMessageNetwork} type="body2" />
          )}
          <button onClick={onClick} className={classes.finaliseButton}>
            Finalise
          </button>
        </div>
      )}
    </Card>
  );
};

export default TransactionCard;
