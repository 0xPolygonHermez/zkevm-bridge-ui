import { FC, useEffect, useState } from "react";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import useConfirmationStyles from "src/views/transaction-confirmation/transaction-confirmation.styles";
import Header from "src/views/shared/header/header.view";
import { useTransactionContext } from "src/contexts/transaction.context";
import Card from "src/views/shared/card/card.view";
import TokenIcon from "src/views/shared/token-icon/token-icon.view";
import Typography from "src/views/shared/typography/typography.view";
import { useNavigate } from "react-router-dom";
import routes from "src/routes";
import { tokenAmountToNumber } from "src/utils/amounts";
import Button from "src/views/shared/button/button.view";
import Error from "src/views/shared/error/error.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";

const TransactionConfirmation: FC = () => {
  const classes = useConfirmationStyles();
  const [isDisabled, setIsDisabled] = useState(false);
  const { bridge } = useBridgeContext();
  const { account } = useProvidersContext();
  const navigate = useNavigate();
  const { transaction } = useTransactionContext();

  useEffect(() => {
    //TODO Check network connected
  }, [setIsDisabled]);

  useEffect(() => {
    if (!transaction) {
      navigate(routes.home.path);
    }
  }, [navigate, transaction]);

  if (!transaction) {
    return null;
  }

  const onClick = () => {
    const { token, amount, to } = transaction;
    if (account.status === "successful") {
      bridge(token.address, amount, to.chainId, account.data)
        .then(console.log)
        .catch(console.error);
    }
  };

  const ChainFromIcon = transaction.from.icon;
  const ChainToIcon = transaction.to.icon;
  const { amount, token } = transaction;
  const txAmount = tokenAmountToNumber({ amount, token });
  return (
    <>
      <Header title="Confirm Transfer" backTo="home" />
      <Card className={classes.card}>
        <TokenIcon token={transaction.token.symbol} size={46} className={classes.icon} />
        <Typography type="h1">{`${txAmount} ${transaction.token.symbol}`}</Typography>

        <div className={classes.chainsRow}>
          <div className={classes.chainBox}>
            <ChainFromIcon /> {transaction.from.name}
          </div>
          <ArrowRightIcon className={classes.arrow} />
          <div className={classes.chainBox}>
            <ChainToIcon /> {transaction.to.name}
          </div>
        </div>
        <div className={classes.fees}>
          <Typography type="body2">Estimated L2 fees</Typography>
          <Typography type="body1" className={classes.fee}>
            <TokenIcon token="eth" size={20} /> 0.0025 ETH
          </Typography>
          <Typography type="body2" className={classes.betweenFees}>
            Estimated gas fee
          </Typography>
          <Typography type="body1" className={classes.fee}>
            <TokenIcon token="eth" size={20} /> 0.0545 ETH
          </Typography>
        </div>
      </Card>
      <div className={classes.button}>
        <Button onClick={onClick} disabled={isDisabled}>
          Transfer
        </Button>
        {isDisabled && <Error error="Switch to Polygon Hermez chain to continue" />}
      </div>
    </>
  );
};

export default TransactionConfirmation;
