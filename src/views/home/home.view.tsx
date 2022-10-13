import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BigNumber, utils as ethersUtils } from "ethers";

import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import BridgeForm from "src/views/home/components/bridge-form/bridge-form.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import routes from "src/routes";
import { useProvidersContext } from "src/contexts/providers.context";
import { useFormContext } from "src/contexts/form.context";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import InfoBanner from "src/views/shared/info-banner/info-banner.view";
import NetworkBox from "src/views/shared/network-box/network-box.view";
import { EthereumChainId, FormData } from "src/domain";

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
      {account.status === "successful" && (
        <>
          <div className={classes.ethereumAddress}>
            <MetaMaskIcon className={classes.metaMaskIcon} />
            <Typography type="body1">{getPartiallyHiddenEthereumAddress(account.data)}</Typography>
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
