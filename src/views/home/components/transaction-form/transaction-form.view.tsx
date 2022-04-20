import { FC, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useTransactionFormtStyles from "src/views/home/components/transaction-form/transaction-form.styles";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import Error from "src/views/shared/error/error.view";
import Icon from "src/views/shared/icon/icon.view";
import List from "src/views/home/components/list/list.view";
import Button from "src/views/shared/button/button.view";
import AmountInput from "src/views/home/components/amount-input/amount-input.view";
import { Chain, TransactionData } from "src/domain";
import { useEnvContext } from "src/contexts/env.context";

interface TransactionFormProps {
  onSubmit: (transactionData: TransactionData) => void;
}

const TransactionForm: FC<TransactionFormProps> = ({ onSubmit }) => {
  const classes = useTransactionFormtStyles();
  const env = useEnvContext();
  const [list, setList] = useState<List>();
  const [isInvalid, setIsInvalid] = useState(true);
  const [transactionData, setTransactionData] = useState<TransactionData>();

  const onChainFromButtonClick = (from: Chain) => {
    if (env && transactionData) {
      const to = env.chains.find((chain) => chain.chainId !== from.chainId);

      if (to) {
        setTransactionData({ ...transactionData, from, to });
        setList(undefined);
      }
    }
  };

  // const onChainToButtonClick = (to: Chain) => {
  //   if (transactionData) {
  //     setTransactionData({ ...transactionData, to });
  //     setList(undefined);
  //   }
  // };

  // const onTokenClick = (token: Token) => {
  //   if (transactionData) {
  //     setTransactionData({ ...transactionData, token });
  //     setList(undefined);
  //   }
  // };

  const onInputChange = ({ amount, isInvalid }: { amount: BigNumber; isInvalid: boolean }) => {
    if (transactionData) {
      setTransactionData({ ...transactionData, amount });
      setIsInvalid(isInvalid);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionData) {
      onSubmit(transactionData);
    }
  };

  useEffect(() => {
    if (env) {
      setTransactionData({
        from: env.chains[0],
        to: env.chains[1],
        token: env.tokens.ETH,
        amount: BigNumber.from(0),
      });
    }
  }, [env]);

  if (!env || !transactionData) {
    return null;
  }

  return (
    env &&
    transactionData && (
      <form className={classes.form} onSubmit={onFormSubmit}>
        <Card className={classes.card}>
          <div className={classes.row}>
            <div className={classes.box}>
              <Typography type="body2">From</Typography>
              <button
                className={`${classes.chainSelector} ${classes.chainSelectorButton}`}
                onClick={() =>
                  setList({ type: "chain", items: env.chains, onClick: onChainFromButtonClick })
                }
                type="button"
              >
                <transactionData.from.Icon />
                <Typography type="body1">{transactionData.from.name}</Typography>
                <CaretDown />
              </button>
            </div>
            <div className={classes.box}>
              <Typography type="body2">Balance</Typography>
              <Typography type="body1">2.0 ETH</Typography>
            </div>
          </div>
          <div className={`${classes.row} ${classes.middleRow}`}>
            <div
              className={classes.tokenSelector}
              // onClick={() => setList({ type: "token", items: tokens, onClick: onTokenClick })}
            >
              <Icon url={transactionData.token.logoURI} size={24} />
              <Typography type="h2">{transactionData.token.symbol}</Typography>
              {/* <CaretDown className={classes.icons} /> */}
            </div>
            <AmountInput
              token={transactionData.token}
              balance={BigNumber.from(parseUnits("2.0", transactionData.token.decimals))}
              fee={BigNumber.from(parseUnits("0.0001", transactionData.token.decimals))}
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
              <div
                className={classes.chainSelector}
                // onClick={() =>
                //   setList({ type: "chain", items: env.chains, onClick: onChainToButtonClick })
                // }
              >
                <transactionData.to.Icon />
                <Typography type="body1">{transactionData.to.name}</Typography>
                {/* <CaretDown /> */}
              </div>
            </div>
            <div className={classes.box}>
              <Typography type="body2">Balance</Typography>
              <Typography type="body1">2.0 ETH</Typography>
            </div>
          </div>
        </Card>
        <div className={classes.button}>
          <Button type="submit" disabled={!transactionData || isInvalid}>
            Continue
          </Button>
          {isInvalid && !transactionData.amount.isZero() && <Error error="Insufficient balance" />}
        </div>
        {list && (
          <List
            placeholder={list.type === "chain" ? "Search network" : "Search token"}
            list={list}
            onClose={() => setList(undefined)}
          />
        )}
      </form>
    )
  );
};

export default TransactionForm;
