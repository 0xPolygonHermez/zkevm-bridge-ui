import { BigNumber, utils as ethersUtils } from "ethers";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { EthereumChainId, FormData } from "src/domain";
import { routes } from "src/routes";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import BridgeForm from "src/views/home/components/bridge-form/bridge-form.view";
import Header from "src/views/home/components/header/header.view";
import useHomeStyles from "src/views/home/home.styles";
import InfoBanner from "src/views/shared/info-banner/info-banner.view";
import NetworkBox from "src/views/shared/network-box/network-box.view";
import Typography from "src/views/shared/typography/typography.view";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const { formData, setFormData } = useFormContext();
  const env = useEnvContext();
  const { getMaxEtherBridge } = useBridgeContext();
  const [maxEtherBridge, setMaxEtherBridge] = useState<BigNumber>();
  const { connectedProvider } = useProvidersContext();

  const onFormSubmit = (formData: FormData) => {
    setFormData(formData);
    navigate(routes.bridgeConfirmation.path);
  };

  const onResetForm = () => {
    setFormData(undefined);
  };

  useEffect(() => {
    if (env) {
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
          <InfoBanner
            className={classes.maxEtherBridgeInfo}
            message={`ETH bridges in the ${
              EthereumChainId.GOERLI === env?.chains[0].chainId ? "Ethereum Goerli" : "Ethereum"
            } network are limited to ${
              maxEtherBridge ? ethersUtils.formatEther(maxEtherBridge) : "--"
            } ETH in early testnet versions`}
          />
          <BridgeForm
            account={connectedProvider.data.account}
            formData={formData}
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
