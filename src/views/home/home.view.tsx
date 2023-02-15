import { useNavigate } from "react-router-dom";

import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { FormData } from "src/domain";
import { routes } from "src/routes";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { BridgeForm } from "src/views/home/components/bridge-form/bridge-form.view";
import { Header } from "src/views/home/components/header/header.view";
import { useHomeStyles } from "src/views/home/home.styles";
import { NetworkBox } from "src/views/shared/network-box/network-box.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const { formData, setFormData } = useFormContext();
  const { connectedProvider } = useProvidersContext();

  const onFormSubmit = (formData: FormData) => {
    setFormData(formData);
    navigate(routes.bridgeConfirmation.path);
  };

  const onResetForm = () => {
    setFormData(undefined);
  };

  return (
    <div className={classes.contentWrapper}>
      <Header />
      {connectedProvider.status === "successful" && (
        <>
          <div className={classes.ethereumAddress}>
            <MetaMaskIcon className={classes.metaMaskIcon} />
            <Typography type="body1">
              {getPartiallyHiddenEthereumAddress(connectedProvider.data.account)}
            </Typography>
          </div>
          <div className={classes.networkBoxWrapper}>
            <NetworkBox />
          </div>
          <BridgeForm
            account={connectedProvider.data.account}
            formData={formData}
            onResetForm={onResetForm}
            onSubmit={onFormSubmit}
          />
        </>
      )}
    </div>
  );
};
