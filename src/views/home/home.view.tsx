import { useNavigate } from "react-router-dom";

import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import BridgeForm from "src/views/home/components/bridge-form/bridge-form.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useProvidersContext } from "src/contexts/providers.context";
import { FormData } from "src/domain";
import { serializeFormData } from "src/adapters/browser";
import routes from "src/routes";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const { account } = useProvidersContext();

  const onFormSubmit = (formData: FormData) => {
    navigate(routes.bridgeConfirmation.path, { state: serializeFormData(formData) });
  };

  return (
    <div className={classes.contentWrapper}>
      <Header />
      {account.status === "successful" && (
        <>
          <div className={classes.ethereumAddress}>
            <MetaMaskIcon className={classes.metaMaskIcon} />
            <Typography type="body1">{getPartiallyHiddenEthereumAddress(account.data)}</Typography>
          </div>
          <BridgeForm onSubmit={onFormSubmit} account={account.data} />
        </>
      )}
    </div>
  );
};

export default Home;
