import { FC } from "react";

import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useAmountInputStyles from "src/views/home/components/cards/cards.styles";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import TokenIcon from "src/views/shared/token-icon/token-icon.view";
import List from "src/views/home/components/list/list.view";
import { useGlobalContext } from "src/contexts/global.context";
import tokens from "src/assets/tokens/tokens.json";
import { chains } from "src/assets/chains/chains";
import { useTransactionContext } from "src/contexts/transaction.context";
import { Chain, Token } from "src/domain";

const Cards: FC = () => {
  const classes = useAmountInputStyles();
  const { openModal, closeModal } = useGlobalContext();
  const { transaction, setTransaction } = useTransactionContext();
  const ChainFromIcon = transaction.chainFrom.icon;
  const ChainToIcon = transaction.chainTo.icon;

  const onChainFromButtonClick = (chainFrom: Chain) => {
    setTransaction({ ...transaction, chainFrom });
    closeModal();
  };
  const onChainToButtonClick = (chainTo: Chain) => {
    setTransaction({ ...transaction, chainTo });
    closeModal();
  };
  const onTokenClick = (token: Token) => {
    setTransaction({ ...transaction, token });
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

  return (
    <>
      <Card className={classes.card}>
        <div className={classes.row}>
          <Typography type="body2">From</Typography>
          <Typography type="body2">Balance</Typography>
        </div>
        <div className={classes.row}>
          <button className={classes.chainSelector} onClick={onChainFromSelectorClick}>
            <ChainFromIcon /> <Typography type="body1">{transaction.chainFrom.name}</Typography>
            <CaretDown />
          </button>
          <Typography type="body1">2.0 ETH</Typography>
        </div>
        <div className={`${classes.row} ${classes.middleRow}`}>
          <div className={classes.maxWrapper}>
            <button className={classes.tokenSelector} onClick={onTokenSelectorClick}>
              <TokenIcon token={transaction.token.symbol} className={classes.icons} size={6} />
              <Typography type="h2">{transaction.token.symbol}</Typography>
              <CaretDown className={classes.icons} />
            </button>
            <button className={classes.maxButton}>
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
          <Typography type="body2">To</Typography>
          <Typography type="body2">Balance</Typography>
        </div>
        <div className={classes.row}>
          <button className={classes.chainSelector} onClick={onChainToSelectorClick}>
            <ChainToIcon /> <Typography type="body1">{transaction.chainTo.name}</Typography>
            <CaretDown />
          </button>
          <Typography type="body1">2.0 ETH</Typography>
        </div>
      </Card>
    </>
  );
};

export default Cards;
