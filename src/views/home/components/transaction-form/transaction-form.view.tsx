import { FC, useEffect, useState } from "react";
import { BigNumber } from "ethers";

import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useTransactionFormStyles from "src/views/home/components/transaction-form/transaction-form.styles";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import Error from "src/views/shared/error/error.view";
import Icon from "src/views/shared/icon/icon.view";
import List from "src/views/home/components/list/list.view";
import Button from "src/views/shared/button/button.view";
import AmountInput from "src/views/home/components/amount-input/amount-input.view";
import { useEnvContext } from "src/contexts/env.context";
import {
  AsyncTask,
  isAsyncTaskDataAvailable,
  isEthersInsufficientFundsError,
} from "src/utils/types";
import { getChainName } from "src/utils/labels";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useErrorContext } from "src/contexts/error.context";
import { Chain, Token, TransactionData } from "src/domain";
import { formatTokenAmount } from "src/utils/amounts";
import { useProvidersContext } from "src/contexts/providers.context";

interface TransactionFormProps {
  onSubmit: (transactionData: TransactionData) => void;
  resetTransaction: () => void;
  transaction?: TransactionData;
  account: string;
}

interface FormChains {
  from: Chain;
  to: Chain;
}

const TransactionForm: FC<TransactionFormProps> = ({
  onSubmit,
  transaction,
  account,
  resetTransaction,
}) => {
  const classes = useTransactionFormStyles();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { estimateBridgeGasPrice, getBalance } = useBridgeContext();
  const { connectedProvider } = useProvidersContext();
  const [list, setList] = useState<List>();
  const [balanceFrom, setBalanceFrom] = useState<BigNumber>();
  const [balanceTo, setBalanceTo] = useState<BigNumber>();
  const [inputError, setInputError] = useState<string>();
  const [chains, setChains] = useState<FormChains>();
  const [token, setToken] = useState<Token>();
  const [amount, setAmount] = useState<BigNumber>();
  const [estimatedFee, setEstimatedFee] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });

  const onChainFromButtonClick = (from: Chain) => {
    if (env && chains) {
      const to = env.chains.find((chain) => chain.key !== from.key);

      if (to) {
        setChains({ from, to });
        setList(undefined);
        setAmount(undefined);
      }
    }
  };

  const onTokenButtonClick = (token: Token) => {
    setToken(token);
    setList(undefined);
  };

  const onInputChange = ({ amount, error }: { amount?: BigNumber; error?: string }) => {
    setAmount(amount);
    setInputError(error);
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chains && token && amount && estimatedFee.status === "successful") {
      onSubmit({
        token: token,
        from: chains.from,
        to: chains.to,
        amount: amount,
        estimatedFee: estimatedFee.data,
      });
    }
  };

  useEffect(() => {
    if (env !== undefined && connectedProvider && transaction === undefined) {
      const from = env.chains.find((chain) => chain.chainId === connectedProvider.chainId);
      const to = env.chains.find((chain) => chain.chainId !== connectedProvider.chainId);
      if (from && to) {
        setChains({ from, to });
      }
      setToken(env.tokens.ETH);
      setAmount(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedProvider, env]);

  useEffect(() => {
    if (transaction !== undefined) {
      setChains({ from: transaction.from, to: transaction.to });
      setToken(transaction.token);
      setAmount(transaction.amount);
      resetTransaction();
    }
  }, [transaction, resetTransaction]);

  useEffect(() => {
    if (chains && token && env) {
      if (token.address === env.tokens.ETH.address) {
        void chains.from.provider.getBalance(account).then(setBalanceFrom).catch(notifyError);
        void chains.to.provider
          .getBalance(account)
          .then(setBalanceTo)
          .catch(() => setBalanceTo(undefined));
      } else {
        void getBalance({ token, chain: chains.from, ethereumAddress: account })
          .then(setBalanceFrom)
          .catch(notifyError);
        void getBalance({ token, chain: chains.to, ethereumAddress: account })
          .then(setBalanceTo)
          .catch(() => setBalanceTo(undefined));
      }
    }
  }, [chains, account, token, env, getBalance, notifyError]);

  useEffect(() => {
    if (chains && token) {
      estimateBridgeGasPrice({
        from: chains.from,
        to: chains.to,
        token,
        destinationAddress: account,
      })
        .then((estimatedFee) => {
          setEstimatedFee({ status: "successful", data: estimatedFee });
        })
        .catch((error) => {
          if (isEthersInsufficientFundsError(error)) {
            setEstimatedFee({
              status: "failed",
              error: `You don't have enough ${token.symbol} to pay for the fees`,
            });
          } else {
            notifyError(error);
          }
        });
    }
  }, [account, chains, token, estimateBridgeGasPrice, notifyError]);

  if (!env || !chains || !token) {
    return null;
  }

  return (
    <form className={classes.form} onSubmit={onFormSubmit}>
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.box}>
            <Typography type="body2">From</Typography>
            <button
              className={`${classes.chainSelector} ${classes.chainSelectorButton}`}
              onClick={() =>
                setList({
                  type: "chain",
                  items: env.chains,
                  onClick: onChainFromButtonClick,
                })
              }
              type="button"
            >
              <chains.from.Icon />
              <Typography type="body1">{getChainName(chains.from)}</Typography>
              <CaretDown />
            </button>
          </div>
          <div className={`${classes.box} ${classes.alignRight}`}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">
              {`${balanceFrom ? formatTokenAmount(balanceFrom, token) : "--"} ${token.symbol}`}
            </Typography>
          </div>
        </div>
        <div className={`${classes.row} ${classes.middleRow}`}>
          <button
            className={classes.tokenSelector}
            onClick={() =>
              setList({
                type: "token",
                items: Object.values(env.tokens),
                onClick: onTokenButtonClick,
              })
            }
            type="button"
          >
            <Icon url={token.logoURI} size={24} />
            <Typography type="h2">{token.symbol}</Typography>
            <CaretDown />
          </button>
          <AmountInput
            value={amount}
            token={token}
            balance={balanceFrom || BigNumber.from(0)}
            fee={isAsyncTaskDataAvailable(estimatedFee) ? estimatedFee.data : undefined}
            onChange={onInputChange}
          />
        </div>
      </Card>
      <div className={classes.arrowRow}>
        <div className={classes.arrowDownIcon}>
          <ArrowDown />
        </div>
      </div>
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.box}>
            <Typography type="body2">To</Typography>
            <div className={classes.chainSelector}>
              <chains.to.Icon />
              <Typography type="body1">{getChainName(chains.to)}</Typography>
            </div>
          </div>
          <div className={`${classes.box} ${classes.alignRight}`}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">
              {`${balanceTo ? formatTokenAmount(balanceTo, token) : "--"} ${token.symbol}`}
            </Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <Button
          type="submit"
          disabled={
            !amount ||
            amount.isZero() ||
            inputError !== undefined ||
            estimatedFee.status === "failed"
          }
        >
          Continue
        </Button>
        {amount && inputError && estimatedFee.status !== "failed" && <Error error={inputError} />}
        {estimatedFee.status === "failed" && <Error error={estimatedFee.error} />}
      </div>
      {list && (
        <List
          placeholder={list.type === "chain" ? "Search network" : "Search token"}
          list={list}
          selectedItem={list.type === "chain" ? chains.from.key : token.address}
          onClose={() => setList(undefined)}
        />
      )}
    </form>
  );
};

export default TransactionForm;
