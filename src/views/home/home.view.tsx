import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import TransactionForm from "src/views/home/components/transaction-form/transaction-form.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useProvidersContext } from "src/contexts/providers.context";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useTransactionContext } from "src/contexts/transaction.context";
import { TransactionData } from "src/domain";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const { setTransaction } = useTransactionContext();
  const { account } = useProvidersContext();
  const { bridge } = useBridgeContext();

  const onFormSubmit = (transaction: TransactionData) => {
    const { token, amount, to } = transaction;

    setTransaction(transaction);
    if (account.status === "successful") {
      bridge(token.address, amount, to.chainId, account.data)
        .then(console.log)
        .catch(console.error);
    }
  };

  return (
    <>
      <Header />
      {account.status === "successful" && (
        <div className={classes.ethereumAddress}>
          <MetaMaskIcon className={classes.metaMaskIcon} />
          <Typography type="body1">{getPartiallyHiddenEthereumAddress(account.data)}</Typography>
        </div>
      )}
      <TransactionForm onSubmit={onFormSubmit} />
    </>
  );
};

export default Home;
