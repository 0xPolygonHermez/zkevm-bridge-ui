import { FC, useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
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
import { Chain, Token, TransactionData } from "src/domain";
import { useEnvContext } from "src/contexts/env.context";

interface TransactionFormProps {
  onSubmit: (transactionData: TransactionData) => void;
  transaction?: TransactionData;
  account: string;
}

interface FormData {
  from: Chain;
  to: Chain;
  token: Token;
  amount?: BigNumber;
}

const TransactionForm: FC<TransactionFormProps> = ({ onSubmit, transaction, account }) => {
  const classes = useTransactionFormtStyles();
  const env = useEnvContext();
  const [list, setList] = useState<List>();
  const [error, setError] = useState<string>();
  const [balanceFrom, setBalanceFrom] = useState(BigNumber.from(0));
  const [balanceTo, setBalanceTo] = useState(BigNumber.from(0));
  const [formData, setFormData] = useState<FormData | undefined>(transaction);

  const onChainFromButtonClick = (from: Chain) => {
    if (env && formData) {
      const to = env.chains.find((chain) => chain.key !== from.key);
      if (to) {
        setFormData({ ...formData, from, to, amount: undefined });
        setList(undefined);
      }
    }
  };

  const onInputChange = ({ amount, error }: { amount?: BigNumber; error?: string }) => {
    if (formData && amount) {
      setFormData({ ...formData, amount });
      setError(error);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && formData.amount) {
      onSubmit({
        ...formData,
        amount: formData.amount,
      });
    }
  };

  useEffect(() => {
    void formData?.from.provider.getBalance(account).then(setBalanceFrom);
    void formData?.to.provider.getBalance(account).then(setBalanceTo);
  }, [formData?.from, formData?.to, account]);

  useEffect(() => {
    if (env && !transaction) {
      setFormData({
        from: env.chains[0],
        to: env.chains[1],
        token: env.tokens.ETH,
      });
    }
  }, [env, transaction]);

  if (!env || !formData) {
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
                setList({ type: "chain", items: env.chains, onClick: onChainFromButtonClick })
              }
              type="button"
            >
              <formData.from.Icon />
              <Typography type="body1">{formData.from.name}</Typography>
              <CaretDown />
            </button>
          </div>
          <div className={`${classes.box} ${classes.alignRight}`}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">{ethers.utils.formatEther(balanceFrom)} ETH</Typography>
          </div>
        </div>
        <div className={`${classes.row} ${classes.middleRow}`}>
          <div
            className={classes.tokenSelector}
            // onClick={() => setList({ type: "token", items: tokens, onClick: onTokenClick })}
          >
            <Icon url={formData.token.logoURI} size={24} />
            <Typography type="h2">{formData.token.symbol}</Typography>
            {/* <CaretDown className={classes.icons} /> */}
          </div>
          <AmountInput
            value={formData.amount}
            token={formData.token}
            balance={balanceFrom}
            fee={BigNumber.from(parseUnits("0.0001", formData.token.decimals))}
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
              <formData.to.Icon />
              <Typography type="body1">{formData.to.name}</Typography>
              {/* <CaretDown /> */}
            </div>
          </div>
          <div className={`${classes.box} ${classes.alignRight}`}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">{ethers.utils.formatEther(balanceTo)} ETH</Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <Button
          type="submit"
          disabled={!formData.amount || formData.amount.isZero() || error !== undefined}
        >
          Continue
        </Button>
        {formData.amount && error && <Error error={error} />}
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
