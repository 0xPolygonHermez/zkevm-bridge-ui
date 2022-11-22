import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { routerStateParser } from "src/adapters/browser";
import { getPolicyCheck, setPolicyCheck } from "src/adapters/storage";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { EthereumChainId, PolicyCheck, WalletName } from "src/domain";
import routes from "src/routes";
import { getDeploymentName, getNetworkName } from "src/utils/labels";
import Policy from "src/views/login/components/policy/policy.view";
import WalletList from "src/views/login/components/wallet-list/wallet-list.view";
import useLoginStyles from "src/views/login/login.styles";
import Card from "src/views/shared/card/card.view";
import ErrorMessage from "src/views/shared/error-message/error-message.view";
import InfoBanner from "src/views/shared/info-banner/info-banner.view";
import NetworkBox from "src/views/shared/network-box/network-box.view";
import Typography from "src/views/shared/typography/typography.view";

const Login: FC = () => {
  const classes = useLoginStyles();
  const [selectedWallet, setSelectedWallet] = useState<WalletName>();
  const [showPolicy, setShowPolicy] = useState<boolean>(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { connectedProvider, connectProvider } = useProvidersContext();
  const env = useEnvContext();

  const onConnectProvider = () => {
    setPolicyCheck();
    selectedWallet && connectProvider(selectedWallet);
    setShowPolicy(false);
  };

  const onCheckAndConnectProvider = (walletName: WalletName) => {
    setSelectedWallet(walletName);
    const checked = getPolicyCheck();
    if (checked === PolicyCheck.Checked) {
      void connectProvider(walletName);
    } else {
      setShowPolicy(true);
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
      {showPolicy && <Policy onClose={() => setShowPolicy(false)} onConnect={onConnectProvider} />}
    </div>
  );
};

export default Login;
