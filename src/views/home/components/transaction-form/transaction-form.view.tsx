import { FC, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

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
import { Chain, TransactionData } from "src/domain";
import { useEnvContext } from "src/contexts/env.context";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";

interface TransactionFormProps {
  onSubmit: (transactionData: TransactionData) => void;
}

const TransactionForm: FC<TransactionFormProps> = ({ onSubmit }) => {
  const classes = useTransactionFormStyles();
  const env = useEnvContext();
  const { account } = useProvidersContext();
  const { estimateBridgeGasPrice } = useBridgeContext();
  const [list, setList] = useState<List>();
  const [error, setError] = useState<string>();
  const [transactionData, setTransactionData] = useState<TransactionData>();
  const [accountBalance] = useState(parseEther("2"));

  const onChainFromButtonClick = (from: Chain) => {
    if (env && transactionData && account.status === "successful") {
      const to = env.chains.find((chain) => chain.chainId !== from.chainId);

      if (to) {
        setList(undefined);
        estimateBridgeGasPrice({
          chain: from,
          token: transactionData.token,
          amount: accountBalance,
          destinationChain: to,
          destinationAddress: account.data,
        })
          .then((estimatedFee) => {
            setTransactionData({ ...transactionData, from, to, estimatedFee });
          })
          .catch((err) => {
            console.error(err);
            setTransactionData({ ...transactionData, from, to });
          });
      }
    }
  };

  const onInputChange = ({ amount, error }: { amount?: BigNumber; error?: string }) => {
    if (transactionData && amount) {
      setTransactionData({ ...transactionData, amount });
      setError(error);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionData) {
      onSubmit(transactionData);
    }
  };

  useEffect(() => {
    if (env && account.status === "successful") {
      const initialTransactionData: TransactionData = {
        from: env.chains[0],
        to: env.chains[1],
        token: env.tokens.ETH,
        amount: BigNumber.from(0),
      };

      estimateBridgeGasPrice({
        chain: initialTransactionData.from,
        token: initialTransactionData.token,
        amount: accountBalance,
        destinationChain: initialTransactionData.to,
        destinationAddress: account.data,
      })
        .then((estimatedFee) => setTransactionData({ ...initialTransactionData, estimatedFee }))
        .catch((err) => {
          console.error(err);
          setTransactionData(initialTransactionData);
        });
    }
  }, [env, account, accountBalance, estimateBridgeGasPrice]);

  if (!env || !transactionData) {
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
              <transactionData.from.Icon />
              <Typography type="body1">{transactionData.from.label}</Typography>
              <CaretDown />
            </button>
          </div>
          <div className={classes.box}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">2.0 ETH</Typography>
          </div>
        </div>
        <div className={`${classes.row} ${classes.middleRow}`}>
          <div className={classes.tokenSelector}>
            <Icon url={transactionData.token.logoURI} size={24} />
            <Typography type="h2">{transactionData.token.symbol}</Typography>
          </div>
          <AmountInput
            token={transactionData.token}
            balance={accountBalance}
            fee={transactionData.estimatedFee || BigNumber.from(0)}
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
              <transactionData.to.Icon />
              <Typography type="body1">{transactionData.to.label}</Typography>
            </div>
          </div>
          <div className={classes.box}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">2.0 ETH</Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <Button
          type="submit"
          disabled={
            !transactionData.amount || transactionData.amount.isZero() || error !== undefined
          }
        >
          Continue
        </Button>
        {transactionData.amount && error && <Error error={error} />}
      </div>
      {list && (
        <List
          placeholder={list.type === "chain" ? "Search network" : "Search token"}
          list={list}
          onClose={() => setList(undefined)}
        />
      )}
    </form>
  );
};

export default TransactionForm;
