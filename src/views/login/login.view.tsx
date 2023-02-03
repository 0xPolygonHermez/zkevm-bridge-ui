import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { routerStateParser } from "src/adapters/browser";
import { getPolicyCheck, setPolicyCheck } from "src/adapters/storage";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { EthereumChainId, PolicyCheck, WalletName } from "src/domain";
import { routes } from "src/routes";
import { getDeploymentName, getNetworkName } from "src/utils/labels";
import { WalletList } from "src/views/login/components/wallet-list/wallet-list.view";
import { useLoginStyles } from "src/views/login/login.styles";
import { Card } from "src/views/shared/card/card.view";
import { ConfirmPopUp } from "src/views/shared/confirm-pop-up/confirm-pop-up.view";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { InfoBanner } from "src/views/shared/info-banner/info-banner.view";
import { NetworkBox } from "src/views/shared/network-box/network-box.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const Login: FC = () => {
  const classes = useLoginStyles();
  const [selectedWallet, setSelectedWallet] = useState<WalletName>();
  const [showPolicyPopUp, setShowPolicyPopUp] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { connectedProvider, connectProvider } = useProvidersContext();
  const env = useEnvContext();

  const onConnectProvider = () => {
    setPolicyCheck();
    selectedWallet && connectProvider(selectedWallet);
    setShowPolicyPopUp(false);
  };

  const onCheckAndConnectProvider = (walletName: WalletName) => {
    setSelectedWallet(walletName);
    const checked = getPolicyCheck();
    if (checked === PolicyCheck.Checked) {
      void connectProvider(walletName);
    } else {
      setShowPolicyPopUp(true);
    }
  };

  useEffect(() => {
    if (connectedProvider.status === "successful") {
      const routerState = routerStateParser.safeParse(state);

      if (routerState.success) {
        navigate(routerState.data.redirectUrl, { replace: true });
      } else {
        navigate(routes.home.path, { replace: true });
      }
    }
  }, [connectedProvider, state, navigate]);

  if (!env) {
    return null;
  }

  const ethereumChain = env.chains[0];
  const deploymentName = getDeploymentName(ethereumChain);
  const networkName = getNetworkName(ethereumChain);
  const appName = deploymentName !== undefined ? `${deploymentName} Bridge` : "Bridge";
  const networkInfo =
    networkName !== undefined &&
    ethereumChain.chainId !== EthereumChainId.MAINNET &&
    `Connect with ${networkName} testnet environment`;

  return (
    <div className={classes.login}>
      <div className={classes.contentWrapper}>
        <PolygonZkEVMLogo className={classes.logo} />
        <Typography className={classes.appName} type="body1">
          {appName}
        </Typography>
        <div className={classes.networkBoxWrapper}>
          <NetworkBox />
        </div>
        {networkInfo && <InfoBanner message={networkInfo} />}
        <div className={classes.cardWrap}>
          <Card className={classes.card}>
            <>
              <Typography className={classes.cardHeader} type="h1">
                Connect a wallet
              </Typography>
              <WalletList onSelectWallet={onCheckAndConnectProvider} />
            </>
          </Card>
          {connectedProvider.status === "failed" && (
            <ErrorMessage error={connectedProvider.error} />
          )}
        </div>
      </div>
      {showPolicyPopUp && (
        <ConfirmPopUp
          message={
            <Typography type="body2">
              DISCLAIMER: This early version of the public testnet will require frequent maintenance
              and may be restarted if upgrades are needed.
            </Typography>
          }
          onClose={() => setShowPolicyPopUp(false)}
          onConfirm={onConnectProvider}
          title="Welcome to the Polygon zkEVM testnet"
        />
      )}
    </div>
  );
};
