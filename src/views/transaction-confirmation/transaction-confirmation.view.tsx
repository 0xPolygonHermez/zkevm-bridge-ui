import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import useConfirmationStyles from "src/views/transaction-confirmation/transaction-confirmation.styles";
import Header from "src/views/shared/header/header.view";
import { useTransactionContext } from "src/contexts/transaction.context";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";
import Button from "src/views/shared/button/button.view";
import Error from "src/views/shared/error/error.view";
import { useProvidersContext } from "src/contexts/providers.context";
import Icon from "src/views/shared/icon/icon.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { getChainName } from "src/utils/labels";
import { formatTokenAmount } from "src/utils/amounts";
import { isMetamaskUserRejectedRequestError } from "src/utils/types";
import { parseError } from "src/adapters/error";
import { useUIContext } from "src/contexts/ui.context";

const TransactionConfirmation: FC = () => {
  const classes = useConfirmationStyles();
  const navigate = useNavigate();
  const { openSnackbar } = useUIContext();
  const { bridge } = useBridgeContext();
  const { transaction, setTransaction } = useTransactionContext();
  const { account, connectedProvider } = useProvidersContext();
  const [incorrectNetworkMessage, setIncorrectNetworkMessage] = useState<string>();

  const onClick = () => {
    if (transaction && account.status === "successful") {
      const { token, amount, from, to } = transaction;
      bridge({
        from,
        token,
        amount,
        to,
        destinationAddress: account.data,
      })
        .then(() => {
          navigate(routes.activity.path);
          setTransaction(undefined);
        })
        .catch((error) => {
          if (isMetamaskUserRejectedRequestError(error) === false) {
            void parseError(error).then((parsed) => {
              if (parsed === "wrong-network") {
                setIncorrectNetworkMessage(`Switch to ${getChainName(from)} to continue`);
              } else {
                openSnackbar({
                  type: "error",
                  parsed,
                });
              }
            });
          }
        });
    }
  };

  useEffect(() => {
    if (transaction) {
      if (transaction.from.chainId === connectedProvider?.chainId) {
        setIncorrectNetworkMessage(undefined);
      }
    }
  }, [connectedProvider, transaction]);

  useEffect(() => {
    if (!transaction) {
      navigate(routes.home.path);
    }
  }, [navigate, transaction]);

  if (!transaction) {
    return null;
  }

  return (
    <>
      <Header title="Confirm Transfer" backTo="home" />
      <Card className={classes.card}>
        <Icon url={transaction.token.logoURI} size={46} className={classes.icon} />
        <Typography type="h1">
          {`${formatTokenAmount(transaction.amount, transaction.token)} ${
            transaction.token.symbol
          }`}
        </Typography>
        <div className={classes.chainsRow}>
          <div className={classes.chainBox}>
            <transaction.from.Icon /> {getChainName(transaction.from)}
          </div>
          <ArrowRightIcon className={classes.arrow} />
          <div className={classes.chainBox}>
            <transaction.to.Icon /> {getChainName(transaction.to)}
          </div>
        </div>
        <div className={classes.fees}>
          <Typography type="body2" className={classes.betweenFees}>
            Estimated gas fee
          </Typography>
          <Typography type="body1" className={classes.fee}>
            <Icon url={transaction.token.logoURI} size={20} />
            {`~ ${formatTokenAmount(transaction.estimatedFee, transaction.token)} ${
              transaction.token.symbol
            }`}
          </Typography>
        </div>
      </Card>
      <div className={classes.button}>
        <Button onClick={onClick}>Transfer</Button>
        {incorrectNetworkMessage && <Error error={incorrectNetworkMessage} />}
      </div>
    </>
  );
};

export default TransactionConfirmation;
