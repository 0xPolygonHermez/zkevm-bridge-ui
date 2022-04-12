import { FC, useState } from "react";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useTransactionFormtStyles from "src/views/home/components/transaction-form/transaction-form.styles";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import TokenIcon from "src/views/shared/token-icon/token-icon.view";
import List from "src/views/home/components/list/list.view";
import tokens from "src/assets/tokens/tokens.json";
import Button from "src/views/shared/button/button.view";
import AmountInput from "src/views/home/components/amount-input/amount-input.view";
import { chains } from "src/constants";
import { useTransactionContext } from "src/contexts/transaction.context";
import { Chain, Token } from "src/domain";

const TransactionForm: FC = () => {
  const classes = useTransactionFormtStyles();
  const [openList, onOpenList] = useState("");
  const { transaction, setTransaction } = useTransactionContext();
  const [isInvalid, setIsInvalid] = useState(true);
  const [localTransaction, setLocalTransaction] = useState(transaction);
  const ChainFromIcon = localTransaction.from.icon;
  const ChainToIcon = localTransaction.to.icon;

  const onChainFromButtonClick = (from: Chain) => {
    setLocalTransaction({ ...localTransaction, from });
    onOpenList("");
  };
  const onChainToButtonClick = (to: Chain) => {
    setLocalTransaction({ ...localTransaction, to });
    onOpenList("");
  };
  const onTokenClick = (token: Token) => {
    setLocalTransaction({ ...localTransaction, token });
    onOpenList("");
  };
  const showModal = () => {
    switch (openList) {
      case "token":
        return (
          <List
            placeholder="Search token"
            list={{ type: "token", items: tokens, onClick: onTokenClick }}
            onClose={() => onOpenList("")}
          />
        );
      case "from":
        return (
          <List
            placeholder="Search Network"
            list={{ type: "chain", items: chains, onClick: onChainFromButtonClick }}
            onClose={() => onOpenList("")}
          />
        );
      case "to":
        return (
          <List
            placeholder="Search Network"
            list={{ type: "chain", items: chains, onClick: onChainToButtonClick }}
            onClose={() => onOpenList("")}
          />
        );
      default:
        return null;
    }
  };

  const onChange = ({ amount, isInvalid }: { amount: BigNumber; isInvalid: boolean }) => {
    setLocalTransaction({ ...localTransaction, amount });
    setIsInvalid(isInvalid);
  };
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransaction(localTransaction);
  };

  return (
    <form className={classes.form} onSubmit={onSubmit}>
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.box}>
            <Typography type="body2">From</Typography>
            <button
              className={classes.chainSelector}
              onClick={() => onOpenList("from")}
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
            onClick={() => onOpenList("token")}
            type="button"
          >
            <TokenIcon token={localTransaction.token.symbol} size={24} />
            <Typography type="h2">{localTransaction.token.symbol}</Typography>
            <CaretDown className={classes.icons} />
          </button>
          <AmountInput
            token={localTransaction.token}
            balance={BigNumber.from(parseUnits("2.0", localTransaction.token.decimals))}
            fee={BigNumber.from(parseUnits("0.0001", localTransaction.token.decimals))}
            onChange={onChange}
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
              onClick={() => onOpenList("to")}
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
        <Button type="submit" disabled={isInvalid}>
          Continue
        </Button>
        {isInvalid && !localTransaction.amount.isZero() && (
          <Typography type="body1" className={classes.error}>
            Insufficient balance
          </Typography>
        )}
      </div>
      {showModal()}
    </form>
  );
};

export default TransactionForm;
