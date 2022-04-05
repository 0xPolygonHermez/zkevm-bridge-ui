import { createContext, FC, useCallback, useContext, useMemo, useState } from "react";

import { chains } from "src/assets/chains/chains";
import tokens from "src/assets/tokens/tokens.json";
import { Chain, Token } from "src/domain";

type Transaction = {
  chainFrom: Chain;
  chainTo: Chain;
  token: Token;
  amount: number;
};

interface TransactionContext {
  transaction: Transaction;
  setTransaction: (transaction: Transaction) => void;
}

const transactionContextDefaultValue: TransactionContext = {
  transaction: { chainFrom: chains[0], chainTo: chains[1], token: tokens[0], amount: 0 },
  setTransaction: () => {
    console.log("The transaction context is not yet ready");
  },
};

const transactionContext = createContext<TransactionContext>(transactionContextDefaultValue);

const TransactionProvider: FC = (props) => {
  const [chainFrom, setChainFrom] = useState<Chain>(
    transactionContextDefaultValue.transaction.chainFrom
  );
  const [chainTo, setChainTo] = useState<Chain>(transactionContextDefaultValue.transaction.chainTo);
  const [token, setToken] = useState<Token>(transactionContextDefaultValue.transaction.token);
  const [amount, setAmount] = useState(transactionContextDefaultValue.transaction.amount);

  const setTransaction = useCallback((transaction: Transaction) => {
    setChainFrom(transaction.chainFrom);
    setChainTo(transaction.chainTo);
    setToken(transaction.token);
    setAmount(transaction.amount);
  }, []);
  const value = useMemo(() => {
    const transaction = { chainFrom, chainTo, token, amount };
    return { transaction, setTransaction };
  }, [chainFrom, chainTo, token, amount, setTransaction]);

  return <transactionContext.Provider value={value} {...props} />;
};

const useTransactionContext = (): TransactionContext => {
  return useContext(transactionContext);
};

export { TransactionProvider, useTransactionContext };
