import { useNavigate } from "react-router-dom";

import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import TransactionForm from "src/views/home/components/transaction-form/transaction-form.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTransactionContext } from "src/contexts/transaction.context";
import { TransactionData } from "src/domain";
import routes from "src/routes";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const { transaction, setTransaction } = useTransactionContext();
  const { account, networks } = useProvidersContext();

  const onFormSubmit = (transaction: TransactionData) => {
    setTransaction(transaction);
    navigate(routes.transactionConfirmation.path);
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
      <TransactionForm onSubmit={onFormSubmit} networks={networks} transaction={transaction} />
    </>
  );
};

export default Home;
