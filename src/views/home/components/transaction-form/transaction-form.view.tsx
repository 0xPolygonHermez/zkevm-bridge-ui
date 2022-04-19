import { FC, useState } from "react";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { useNavigate } from "react-router-dom";

import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useTransactionFormtStyles from "src/views/home/components/transaction-form/transaction-form.styles";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import Error from "src/views/shared/error/error.view";
import TokenIcon from "src/views/shared/token-icon/token-icon.view";
import List from "src/views/home/components/list/list.view";
import tokens from "src/assets/tokens/tokens.json";
import Button from "src/views/shared/button/button.view";
import AmountInput from "src/views/home/components/amount-input/amount-input.view";
import { chains } from "src/constants";
import { useTransactionContext } from "src/contexts/transaction.context";
import { Chain, Token } from "src/domain";
import routes from "src/routes";

export interface TransactionData {
  from: Chain;
  to: Chain;
  token: Token;
  amount?: BigNumber;
}

const defaultTransaction: TransactionData = {
  from: chains[0],
  to: chains[1],
  token: tokens[0],
};

const TransactionForm: FC = () => {
  const classes = useTransactionFormtStyles();
  const [list, setList] = useState<List>();
  const { transaction, setTransaction } = useTransactionContext();
  const [isInvalid, setIsInvalid] = useState(false);
  const navigate = useNavigate();
  const [localTransaction, setLocalTransaction] = useState(transaction || defaultTransaction);
  const ChainFromIcon = localTransaction.from.icon;
  const ChainToIcon = localTransaction.to.icon;

  const onChainFromButtonClick = (from: Chain) => {
    setLocalTransaction({ ...localTransaction, from });
    setList(undefined);
  };
  const onChainToButtonClick = (to: Chain) => {
    setLocalTransaction({ ...localTransaction, to });
    setList(undefined);
  };
  const onTokenClick = (token: Token) => {
    setLocalTransaction({ ...localTransaction, token });
    setList(undefined);
  };

  const onInputChange = ({ amount, isInvalid }: { amount?: BigNumber; isInvalid: boolean }) => {
    setLocalTransaction({ ...localTransaction, amount });
    setIsInvalid(isInvalid);
  };
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localTransaction && localTransaction.amount) {
      setTransaction({
        ...localTransaction,
        amount: localTransaction.amount,
      });
    }
    navigate(routes.confirmation.path);
  };

  return (
    <form className={classes.form} onSubmit={onSubmit}>
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.box}>
            <Typography type="body2">From</Typography>
            <button
              className={classes.chainSelector}
              onClick={() =>
                setList({ type: "chain", items: chains, onClick: onChainFromButtonClick })
              }
              type="button"
            >
              <ChainFromIcon /> <Typography type="body1">{localTransaction.from.name}</Typography>
              <CaretDown />
            </button>
          </div>
          <div className={classes.box}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">2.0 ETH</Typography>
          </div>
        </div>
        <div className={`${classes.row} ${classes.middleRow}`}>
          <button
            className={classes.tokenSelector}
            onClick={() => setList({ type: "token", items: tokens, onClick: onTokenClick })}
            type="button"
          >
            <TokenIcon token={localTransaction.token.symbol} size={24} />
            <Typography type="h2">{localTransaction.token.symbol}</Typography>
            <CaretDown className={classes.icons} />
          </button>
          <AmountInput
            value={localTransaction.amount}
            token={localTransaction.token}
            balance={BigNumber.from(parseUnits("2.0", localTransaction.token.decimals))}
            fee={BigNumber.from(parseUnits("0.0001", localTransaction.token.decimals))}
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
            <button
              className={classes.chainSelector}
              onClick={() =>
                setList({ type: "chain", items: chains, onClick: onChainToButtonClick })
              }
              type="button"
            >
              <ChainToIcon /> <Typography type="body1">{localTransaction.to.name}</Typography>
              <CaretDown />
            </button>
          </div>
          <div className={classes.box}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">2.0 ETH</Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <Button type="submit" disabled={!localTransaction.amount || isInvalid}>
          Continue
        </Button>
        {localTransaction.amount && isInvalid && <Error error="Insufficient balance" />}
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
