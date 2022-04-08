import { FC } from "react";

import useTransactionFormtStyles from "src/views/home/components/amount-input/amount-input.styles";

const TransactionForm: FC = () => {
  const classes = useTransactionFormtStyles();

  return <input className={classes.amountInput} placeholder="0.00" />;
};

export default TransactionForm;
