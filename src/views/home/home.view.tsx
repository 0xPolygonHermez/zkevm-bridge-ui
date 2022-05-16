import { useNavigate } from "react-router-dom";

import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import BridgeForm from "src/views/home/components/bridge-form/bridge-form.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useProvidersContext } from "src/contexts/providers.context";
import { useFormContext } from "src/contexts/form.context";
import { FormData } from "src/domain";
import routes from "src/routes";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const { formData, setFormData } = useFormContext();
  const { account } = useProvidersContext();

  const onFormSubmit = (formData: FormData) => {
    setFormData(formData);
    navigate(routes.bridgeConfirmation.path);
  };

  const resetFormData = () => {
    setFormData(undefined);
  };

  return (
    <>
      <Header />
      {account.status === "successful" && (
        <>
          <div className={classes.ethereumAddress}>
            <MetaMaskIcon className={classes.metaMaskIcon} />
            <Typography type="body1">{getPartiallyHiddenEthereumAddress(account.data)}</Typography>
          </div>
          <BridgeForm
            onSubmit={onFormSubmit}
            formData={formData}
            resetFormData={resetFormData}
            account={account.data}
          />
        </>
      )}
    </>
  );
};

export default Home;
