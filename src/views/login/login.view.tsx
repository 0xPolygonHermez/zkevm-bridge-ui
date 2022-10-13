import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Card from "src/views/shared/card/card.view";
import useLoginStyles from "src/views/login/login.styles";
import Typography from "src/views/shared/typography/typography.view";
import Error from "src/views/shared/error/error.view";
import WalletList from "src/views/login/components/wallet-list/wallet-list.view";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { useProvidersContext } from "src/contexts/providers.context";
import { useEnvContext } from "src/contexts/env.context";
import { getDeploymentName, getNetworkName } from "src/utils/labels";
import routes from "src/routes";
import { WalletName, EthereumChainId, PolicyCheck } from "src/domain";
import { routerStateParser } from "src/adapters/browser";
import InfoBanner from "src/views/shared/info-banner/info-banner.view";
import Policy from "src/views/login/components/policy/policy.view";
import { getPolicyCheck, setPolicyCheck } from "src/adapters/storage";

const Login: FC = () => {
  const classes = useLoginStyles();
  const [selectedWallet, setSelectedWallet] = useState<WalletName>();
  const [showPolicy, setShowPolicy] = useState<boolean>(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    account,
    connectProvider,
    getMetaMaskProvider,
    silentlyGetMetaMaskConnectedAccounts,
    connectMetaMaskProvider,
  } = useProvidersContext();
  const env = useEnvContext();
  const [isAccountAlreadyConnected, setIsAccountAlreadyConnected] = useState<boolean>();

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
    const web3Provider = getMetaMaskProvider();

    if (env && web3Provider) {
      void silentlyGetMetaMaskConnectedAccounts({ web3Provider }).then((accounts) => {
        const account = accounts ? accounts[0] : undefined;

        if (!account) {
          setIsAccountAlreadyConnected(false);
        } else {
          return connectMetaMaskProvider({ env, web3Provider, account }).then(() =>
            setIsAccountAlreadyConnected(true)
          );
        }
      });
    }
  }, [connectMetaMaskProvider, env, getMetaMaskProvider, silentlyGetMetaMaskConnectedAccounts]);

  useEffect(() => {
    if (account.status === "successful") {
      const routerState = routerStateParser.safeParse(state);

      if (routerState.success) {
        navigate(routerState.data.redirectUrl, { replace: true });
      } else {
        navigate(routes.home.path, { replace: true });
      }
    }
  }, [account, state, navigate]);

  if (!env || isAccountAlreadyConnected !== false) {
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
        <Typography type="body1" className={classes.appName}>
          {appName}
        </Typography>
        {networkInfo && <InfoBanner message={networkInfo} />}
        <div className={classes.cardWrap}>
          <Card className={classes.card}>
            <>
              <Typography type="h1" className={classes.cardHeader}>
                Connect a wallet
              </Typography>
              <WalletList onSelectWallet={onCheckAndConnectProvider} />
            </>
          </Card>
          {account.status === "failed" && <Error error={account.error} />}
        </div>
      </div>
      {showPolicy && <Policy onClose={() => setShowPolicy(false)} onConnect={onConnectProvider} />}
    </div>
  );
};

export default Login;
