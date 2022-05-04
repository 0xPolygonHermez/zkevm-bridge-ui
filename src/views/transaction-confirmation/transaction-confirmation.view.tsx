import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatUnits } from "ethers/lib/utils";

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

const TransactionConfirmation: FC = () => {
  const classes = useConfirmationStyles();
  const [isNetworkIncorrect, setIsNetworkIncorrect] = useState(false);
  const { bridge } = useBridgeContext();
  const { account, connectedProvider } = useProvidersContext();
  const navigate = useNavigate();
  const { transaction } = useTransactionContext();

  const onClick = () => {
    if (transaction) {
      const { token, amount, from, to } = transaction;

      if (account.status === "successful") {
        bridge({
          from,
          token,
          amount,
          to,
          destinationAddress: account.data,
        })
          .then(console.log)
          .catch(console.error);
      }
    }
  };

  useEffect(() => {
    if (connectedProvider && transaction) {
      void connectedProvider.getNetwork().then((network) => {
        void transaction.from.provider.getNetwork().then((networkFrom) => {
          setIsNetworkIncorrect(network.chainId !== networkFrom.chainId);
        });
      });
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
          {`${formatUnits(transaction.amount, transaction.token.decimals)} ${
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
            {`${formatUnits(transaction.estimatedFee, transaction.token.decimals)} ${
              transaction.token.symbol
            }`}
          </Typography>
        </div>
      </Card>
      <div className={classes.button}>
        <Button onClick={onClick} disabled={isNetworkIncorrect}>
          Transfer
        </Button>
        {isNetworkIncorrect && (
          <Error error={`Switch to ${getChainName(transaction.from)} to continue`} />
        )}
      </div>
    </>
  );
};

export default TransactionConfirmation;
