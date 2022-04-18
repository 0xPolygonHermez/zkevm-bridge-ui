import { FC, useEffect } from "react";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import useConfirmationStyles from "src/views/confirmation/confirmation.styles";
import Header from "src/views/shared/header/header.view";
import { useTransactionContext } from "src/contexts/transaction.context";
import Card from "src/views/shared/card/card.view";
import TokenIcon from "src/views/shared/token-icon/token-icon.view";
import Typography from "src/views/shared/typography/typography.view";
import { useNavigate } from "react-router-dom";
import routes from "src/routes";
import { convertBigNumberToNumber, convertTokenAmountToFiat } from "src/utils/amounts";
import Button from "src/views/shared/button/button.view";

const Confirmation: FC = () => {
  const classes = useConfirmationStyles();
  const navigate = useNavigate();
  const { transaction } = useTransactionContext();

  useEffect(() => {
    if (!transaction) {
      navigate(routes.home.path);
    }
  }, [navigate, transaction]);

  if (!transaction) {
    return null;
  }

  const onClick = () => null;

  const ChainFromIcon = transaction.from.icon;
  const ChainToIcon = transaction.to.icon;
  const { amount, token } = transaction;
  const txAmount = convertBigNumberToNumber({ amount, token });
  return (
    <>
      <Header title="Confirm Transfer" backTo="home" />
      <Card className={classes.card}>
        <TokenIcon token={transaction.token.symbol} size={46} className={classes.icon} />
        <Typography type="h1">{`${txAmount} ${transaction.token.symbol}`}</Typography>
        <Typography type="body2">
          {convertTokenAmountToFiat({
            amount: txAmount,
            token: "eth",
          })}
        </Typography>
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
            <TokenIcon token="eth" size={20} />
            {`0.0025 ETH ~ ${convertTokenAmountToFiat({
              amount: 0.0025,
              token: "eth",
            })}`}
          </Typography>
          <Typography type="body2" className={classes.betweenFees}>
            Estimated gas fee
          </Typography>
          <Typography type="body1" className={classes.fee}>
            <TokenIcon token="eth" size={20} />
            {`0.0545 ETH ~ ${convertTokenAmountToFiat({
              amount: 0.0545,
              token: "eth",
            })}`}
          </Typography>
        </div>
      </Card>
      <div className={classes.button}>
        <Button onClick={onClick}>Transfer</Button>
      </div>
    </>
  );
};

export default Confirmation;
