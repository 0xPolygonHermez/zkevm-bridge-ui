import { Link } from "react-router-dom";

import { ReactComponent as Deposit } from "src/assets/icons/deposit.svg";
import { ReactComponent as Withdraw } from "src/assets/icons/withdraw.svg";
import useTransactionActionsStyles from "src/views/home/components/transaction-actions/transaction-actions.styles";

const TransactionActions = () => {
  const classes = useTransactionActionsStyles();
  return (
    <div className={classes.buttons}>
      <Link to={"/"} className={classes.actionBtn}>
        <p className={classes.circle}>
          <Deposit />
        </p>
        <p className={classes.actionText}>Deposit</p>
      </Link>
      <Link to={"/"} className={classes.actionBtn}>
        <p className={classes.circle}>
          <Withdraw />
        </p>
        <p className={classes.actionText}>Withdraw</p>
      </Link>
    </div>
  );
};

export default TransactionActions;
