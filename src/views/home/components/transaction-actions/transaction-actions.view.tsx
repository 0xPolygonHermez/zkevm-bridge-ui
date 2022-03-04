import { Link } from "react-router-dom";

import { ReactComponent as DepositIcon } from "src/assets/icons/deposit.svg";
import { ReactComponent as WithdrawIcon } from "src/assets/icons/withdraw.svg";
import useTransactionActionsStyles from "src/views/home/components/transaction-actions/transaction-actions.styles";

const TransactionActions = () => {
  const classes = useTransactionActionsStyles();
  return (
    <div className={classes.buttons}>
      <div className={classes.buttonBox}>
        <Link to={"/"} className={classes.actionButton}>
          <DepositIcon />
        </Link>
        <p className={classes.actionText}>Deposit</p>
      </div>
      <div className={classes.buttonBox}>
        <Link to={"/"} className={classes.actionButton}>
          <WithdrawIcon />
        </Link>
        <p className={classes.actionText}>Withdraw</p>
      </div>
    </div>
  );
};

export default TransactionActions;
