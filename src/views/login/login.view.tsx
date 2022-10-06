import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Card from "src/views/shared/card/card.view";
import useLoginStyles from "src/views/login/login.styles";
import Typography from "src/views/shared/typography/typography.view";
import Error from "src/views/shared/error/error.view";
import WalletList from "src/views/login/components/wallet-list/wallet-list.view";
import AccountLoader from "src/views/login/components/account-loader/account-loader.view";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { useProvidersContext } from "src/contexts/providers.context";
import { useEnvContext } from "src/contexts/env.context";
import { getDeploymentName, getNetworkName } from "src/utils/labels";
import routes from "src/routes";
import { WalletName, EthereumChainId } from "src/domain";
import { routerStateParser } from "src/adapters/browser";
import InfoBanner from "src/views/shared/info-banner/info-banner.view";

const Login: FC = () => {
  const classes = useLoginStyles();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { connectProvider, account } = useProvidersContext();
  const env = useEnvContext();
  const [selectedWallet, setSelectedWallet] = useState<WalletName>();

  const onConnectProvider = (walletName: WalletName) => {
    setSelectedWallet(walletName);
    void connectProvider(walletName);
  };

  useEffect(() => {
    if (account.status === "failed" || account.status === "pending") {
      setSelectedWallet(undefined);
    }
    if (account.status === "successful") {
      const routerState = routerStateParser.safeParse(state);

      if (routerState.success) {
        navigate(routerState.data.redirectUrl, { replace: true });
      } else {
        navigate(routes.home.path, { replace: true });
      }
    }
  }, [account, state, navigate]);

  if (!env) {
    return null;
  }

  const ethereumChain = env.chains[0];
  const deploymentName = getDeploymentName(ethereumChain);
  const networkName = getNetworkName(ethereumChain);
  const appName = deploymentName !== undefined ? `Bridge ${deploymentName}` : "Bridge";
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
            {selectedWallet === undefined ? (
              <>
                <Typography type="h1" className={classes.cardHeader}>
                  Connect a wallet
                </Typography>
                <WalletList onSelectWallet={onConnectProvider} />
              </>
            ) : (
              <>
                <Typography
                  type="h1"
                  className={`${classes.cardHeader} ${classes.cardHeaderCentered}`}
                >
                  Connecting to
                </Typography>
                <AccountLoader selectedWallet={selectedWallet} />
              </>
            )}
          </Card>
          {account.status === "failed" && <Error error={account.error} />}
        </div>
      </div>
    </div>
  );
};

export default Login;
