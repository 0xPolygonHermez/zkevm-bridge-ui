import { FC, useEffect, useState } from "react";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import useConfirmationStyles from "src/views/transaction-confirmation/transaction-confirmation.styles";
import Header from "src/views/shared/header/header.view";
import { useTransactionContext } from "src/contexts/transaction.context";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import { useNavigate } from "react-router-dom";
import routes from "src/routes";
import Button from "src/views/shared/button/button.view";
import Error from "src/views/shared/error/error.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { ethers } from "ethers";
import { hexValue } from "ethers/lib/utils";
import Icon from "src/views/shared/icon/icon.view";
import { useEnvContext } from "src/contexts/env.context";

const TransactionConfirmation: FC = () => {
  const classes = useConfirmationStyles();
  const env = useEnvContext();
  const [isDisabled, setIsDisabled] = useState(false);
  const { bridge } = useBridgeContext();
  const { account, connectedProvider, changeNetwork } = useProvidersContext();
  const navigate = useNavigate();
  const { transaction, setTransaction } = useTransactionContext();

  useEffect(() => {
    if (connectedProvider && transaction) {
      void connectedProvider.getNetwork().then((provider) => {
        void transaction.from.provider.getNetwork().then((providerFrom) => {
          setIsDisabled(provider.chainId !== providerFrom.chainId);
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

  const onClick = () => {
    const { amount, to } = transaction;
    if (account.status === "successful") {
      const destinationNetwork = to.key === "ethereum" ? 0 : 1;
      bridge(ethers.constants.AddressZero, amount, destinationNetwork, account.data)
        .then(() => {
          navigate(routes.activity.path);
          setTransaction(undefined);
        })
        .catch(console.error);
    }
  };

  const onChangeNetwork = () => {
    void transaction.from.provider.getNetwork().then((network) => {
      changeNetwork(hexValue(network.chainId));
    });
  };

  return (
    <>
      <Header title="Confirm Transfer" backTo="home" />
      <Card className={classes.card}>
        {env && <Icon url={env.tokens.ETH.logoURI} size={46} className={classes.icon} />}
        <Typography type="h1">{`${ethers.utils.formatEther(transaction.amount)} ${
          transaction.token.symbol
        }`}</Typography>
        <div className={classes.chainsRow}>
          <div className={classes.chainBox}>
            <transaction.from.Icon /> {transaction.from.name}
          </div>
          <ArrowRightIcon className={classes.arrow} />
          <div className={classes.chainBox}>
            <transaction.to.Icon /> {transaction.to.name}
          </div>
        </div>
        <div className={classes.fees}>
          <Typography type="body2">Estimated L2 fees</Typography>
          <Typography type="body1" className={classes.fee}>
            {env && <Icon url={env.tokens.ETH.logoURI} size={20} />} 0.0025 ETH
          </Typography>
          <Typography type="body2" className={classes.betweenFees}>
            Estimated gas fee
          </Typography>
          <Typography type="body1" className={classes.fee}>
            {env && <Icon url={env.tokens.ETH.logoURI} size={20} />} 0.0545 ETH
          </Typography>
        </div>
      </Card>
      <div className={classes.button}>
        <Button onClick={onClick} disabled={isDisabled}>
          Transfer
        </Button>
        {isDisabled && <Error error={`Switch to ${transaction.from.name} to continue`} />}
        {isDisabled && connectedProvider?.connection.url === "metamask" && (
          <button onClick={onChangeNetwork} className={classes.changeButton}>
            Change Network
          </button>
        )}
      </div>
    </>
  );
};

export default TransactionConfirmation;
