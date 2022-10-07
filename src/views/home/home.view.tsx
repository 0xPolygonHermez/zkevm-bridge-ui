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
import routes from "src/routes";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import InfoBanner from "src/views/shared/info-banner/info-banner.view";
import NetworkBox from "src/views/shared/network-box/network-box.view";
import { isMetamaskUserRejectedRequestError } from "src/utils/types";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import { useErrorContext } from "src/contexts/error.context";
import { Chain, FormData } from "src/domain";

const Home = (): JSX.Element => {
  const callIfMounted = useCallIfMounted();
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const { notifyError } = useErrorContext();
  const { formData, setFormData } = useFormContext();
  const env = useEnvContext();
  const { getMaxEtherBridge } = useBridgeContext();
  const [maxEtherBridge, setMaxEtherBridge] = useState<BigNumber>();
  const { account, changeNetwork } = useProvidersContext();

  const onFormSubmit = (formData: FormData) => {
    setFormData(formData);
    navigate(routes.bridgeConfirmation.path);
  };

  const onResetForm = () => {
    setFormData(undefined);
  };

  const onChangeNetwork = (chain: Chain) => {
    changeNetwork(chain).catch((error) => {
      callIfMounted(() => {
        if (isMetamaskUserRejectedRequestError(error) === false) {
          notifyError(error);
        }
      });
    });
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
            <NetworkBox onChangeNetwork={onChangeNetwork} />
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
