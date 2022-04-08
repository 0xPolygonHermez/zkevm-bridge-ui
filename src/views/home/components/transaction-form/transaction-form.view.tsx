import { FC, useState } from "react";

import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useTransactionFormtStyles from "src/views/home/components/transaction-form/transaction-form.styles";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import TokenIcon from "src/views/shared/token-icon/token-icon.view";
import List from "src/views/home/components/list/list.view";
import { useGlobalContext } from "src/contexts/global.context";
import tokens from "src/assets/tokens/tokens.json";
import { chains } from "src/constants";
import { useTransactionContext } from "src/contexts/transaction.context";
import { Chain, Token } from "src/domain";
import Button from "src/views/shared/button/button.view";
import AmountInput from "src/views/home/components/amount-input/amount-input.view";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

const TransactionForm: FC = () => {
  const classes = useTransactionFormtStyles();
  const { openModal, closeModal } = useGlobalContext();
  const { transaction, setTransaction } = useTransactionContext();
  const [isInvalid, setIsInvalid] = useState(true);
  const [localTransaction, setLocalTransaction] = useState(transaction);
  const ChainFromIcon = localTransaction.chainFrom.icon;
  const ChainToIcon = localTransaction.chainTo.icon;

  const onChainFromButtonClick = (chainFrom: Chain) => {
    setLocalTransaction({ ...localTransaction, chainFrom });
    closeModal();
  };
  const onChainToButtonClick = (chainTo: Chain) => {
    setLocalTransaction({ ...localTransaction, chainTo });
    closeModal();
  };
  const onTokenClick = (token: Token) => {
    setLocalTransaction({ ...localTransaction, token });
    closeModal();
  };
  const componentFromChain = () => (
    <List
      placeholder="Search Network"
      list={{ type: "chain", items: chains, onClick: onChainFromButtonClick }}
    />
  );
  const componentToChain = () => (
    <List
      placeholder="Search Network"
      list={{ type: "chain", items: chains, onClick: onChainToButtonClick }}
    />
  );
  const componentToken = () => (
    <List
      placeholder="Search token"
      list={{ type: "token", items: tokens, onClick: onTokenClick }}
    />
  );
  const onChainFromSelectorClick = () => {
    openModal(componentFromChain);
  };
  const onChainToSelectorClick = () => {
    openModal(componentToChain);
  };
  const onTokenSelectorClick = () => {
    openModal(componentToken);
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
          <Typography type="body2">From</Typography>
          <Typography type="body2">Balance</Typography>
        </div>
        <div className={classes.row}>
          <button
            className={classes.chainSelector}
            onClick={onChainFromSelectorClick}
            type="button"
          >
            <ChainFromIcon />{" "}
            <Typography type="body1">{localTransaction.chainFrom.name}</Typography>
            <CaretDown />
          </button>
          <Typography type="body1">2.0 {localTransaction.token.symbol}</Typography>
        </div>
        <div className={`${classes.row} ${classes.middleRow}`}>
          <button className={classes.tokenSelector} onClick={onTokenSelectorClick} type="button">
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
          <Typography type="body2">To</Typography>
          <Typography type="body2">Balance</Typography>
        </div>
        <div className={classes.row}>
          <button className={classes.chainSelector} onClick={onChainToSelectorClick} type="button">
            <ChainToIcon /> <Typography type="body1">{localTransaction.chainTo.name}</Typography>
            <CaretDown />
          </button>
          <Typography type="body1">1.0 {localTransaction.token.symbol}</Typography>
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
    </form>
  );
};

export default TransactionForm;
