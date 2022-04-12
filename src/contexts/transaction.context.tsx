import { createContext, FC, useContext, useMemo, useState } from "react";

import { Transaction } from "src/domain";

interface TransactionContext {
  transaction?: Transaction;
  setTransaction: (transaction: Transaction) => void;
}

const transactionContextDefaultValue: TransactionContext = {
  setTransaction: () => {
    console.error("The transaction context is not yet ready");
  },
};

const transactionContext = createContext<TransactionContext>(transactionContextDefaultValue);

const TransactionProvider: FC = (props) => {
  const [transaction, setTransaction] = useState<Transaction>();

  const value = useMemo(() => {
    return { transaction, setTransaction };
  }, [transaction]);

  return <transactionContext.Provider value={value} {...props} />;
};

const useTransactionContext = (): TransactionContext => {
  return useContext(transactionContext);
};

export { TransactionProvider, useTransactionContext };
