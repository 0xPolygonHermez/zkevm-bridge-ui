import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BigNumber, utils as ethersUtils } from "ethers";

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
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import InfoBanner from "src/views/shared/info-banner/info-banner.view";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const { formData, setFormData } = useFormContext();
  const env = useEnvContext();
  const { getMaxEtherBridge } = useBridgeContext();
  const [maxEtherBridge, setMaxEtherBridge] = useState<BigNumber>();
  const { account } = useProvidersContext();

  const onFormSubmit = (formData: FormData) => {
    setFormData(formData);
    navigate(routes.bridgeConfirmation.path);
  };

  const onResetForm = () => {
    setFormData(undefined);
  };

  useEffect(() => {
    if (env?.chains) {
      void getMaxEtherBridge({ chain: env.chains[0] })
        .then(setMaxEtherBridge)
        .catch(() => {
          setMaxEtherBridge(ethersUtils.parseEther("0.25"));
        });
    }
  }, [env, getMaxEtherBridge]);

  return (
    <div className={classes.contentWrapper}>
      <Header />
      {account.status === "successful" && (
        <>
          <div className={classes.ethereumAddress}>
            <MetaMaskIcon className={classes.metaMaskIcon} />
            <Typography type="body1">{getPartiallyHiddenEthereumAddress(account.data)}</Typography>
          </div>
          <InfoBanner
            className={classes.maxEtherBridgeInfo}
            message={`ETH bridges in the Ethereum network are limited to ${
              maxEtherBridge ? ethersUtils.formatEther(maxEtherBridge) : "--"
            } ETH in early testnet versions`}
          />
          <BridgeForm
            formData={formData}
            account={account.data}
            maxEtherBridge={maxEtherBridge}
            onResetForm={onResetForm}
            onSubmit={onFormSubmit}
          />
        </>
      )}
    </div>
  );
};

export default Home;
