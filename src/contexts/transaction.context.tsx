import { createContext, FC, useContext, useMemo, useState } from "react";

import { chains } from "src/constants";
import tokens from "src/assets/tokens/tokens.json";
import { Transaction } from "src/domain";

interface TransactionContext {
  transaction: Transaction;
  setTransaction: (transaction: Transaction) => void;
}

const transactionContextDefaultValue: TransactionContext = {
  transaction: { from: chains[0], to: chains[1], token: tokens[0], amount: 0 },
  setTransaction: () => {
    console.error("The transaction context is not yet ready");
  },
};

const transactionContext = createContext<TransactionContext>(transactionContextDefaultValue);

const TransactionProvider: FC = (props) => {
  const [transaction, setTransaction] = useState<Transaction>(
    transactionContextDefaultValue.transaction
  );

  const value = useMemo(() => {
    return { transaction, setTransaction };
  }, [transaction]);

  return <transactionContext.Provider value={value} {...props} />;
};

const useTransactionContext = (): TransactionContext => {
  return useContext(transactionContext);
};

export { TransactionProvider, useTransactionContext };
