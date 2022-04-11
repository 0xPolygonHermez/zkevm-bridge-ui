import { FC, useState } from "react";

import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useTransactionFormtStyles from "src/views/home/components/transaction-form/transaction-form.styles";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import TokenIcon from "src/views/shared/token-icon/token-icon.view";
import List from "src/views/home/components/list/list.view";
import { useUIContext } from "src/contexts/ui.context";
import tokens from "src/assets/tokens/tokens.json";
import { chains } from "src/constants";
import { useTransactionContext } from "src/contexts/transaction.context";
import { Chain, Token } from "src/domain";
import Button from "src/views/shared/button/button.view";

const TransactionForm: FC = () => {
  const classes = useTransactionFormtStyles();
  const { openModal, closeModal } = useUIContext();
  const { transaction, setTransaction } = useTransactionContext();
  const [localTransaction, setLocalTransaction] = useState(transaction);
  const ChainFromIcon = localTransaction.from.icon;
  const ChainToIcon = localTransaction.to.icon;

  const onChainFromButtonClick = (from: Chain) => {
    setLocalTransaction({ ...localTransaction, from });
    closeModal();
  };
  const onChainToButtonClick = (to: Chain) => {
    setLocalTransaction({ ...localTransaction, to });
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
              onClick={onChainFromSelectorClick}
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
          <div className={classes.maxWrapper}>
            <button className={classes.tokenSelector} onClick={onTokenSelectorClick} type="button">
              <TokenIcon token={localTransaction.token.symbol} size={24} />
              <Typography type="h2">{localTransaction.token.symbol}</Typography>
              <CaretDown className={classes.icons} />
            </button>
            <button className={classes.maxButton} type="button">
              <Typography type="body2" className={classes.maxText}>
                MAX
              </Typography>
            </button>
          </div>
          <input className={classes.amountInput} placeholder="0.00" />
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
              onClick={onChainToSelectorClick}
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
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
};

export default TransactionForm;
