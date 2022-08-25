import { useLocation, useNavigate } from "react-router-dom";

import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import BridgeForm from "src/views/home/components/bridge-form/bridge-form.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useProvidersContext } from "src/contexts/providers.context";
import { FormData } from "src/domain";
import { formDataRouterStateParser, serializeFormData } from "src/adapters/browser";
import routes from "src/routes";
import { useMemo } from "react";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const { account } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const env = useEnvContext();
  const { state } = useLocation();

  const parsedFormData = useMemo(
    () => (env ? formDataRouterStateParser(env).safeParse(state) : undefined),
    [env, state]
  );

  if (parsedFormData?.success === false) {
    notifyError(parsedFormData.error);
  }

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
          {parsedFormData?.success && (
            <BridgeForm
              onSubmit={onFormSubmit}
              account={account.data}
              initialFormData={parsedFormData.data}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Home;
