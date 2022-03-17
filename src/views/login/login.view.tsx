import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Card from "src/views/shared/card/card.view";
import useLoginStyles from "src/views/login/login.styles";

import Typography from "src/views/shared/typography/typography.view";
import { ReactComponent as PolygonHermezLogo } from "src/assets/polygon-hermez-logo.svg";
import { useEthereumProviderContext } from "src/contexts/ethereum-provider.context";
import { WalletName } from "src/domain";
import routes from "src/routes";
import WalletList from "./components/wallet-list/wallet-list.view";
import AccountLoader from "./components/account-loader/account-loader.view";
import { routerStateParser } from "src/adapters/parsers";

const Login: FC = () => {
  const classes = useLoginStyles();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { connectProvider, account } = useEthereumProviderContext();
  const [selectedWallet, setSelectedWallet] = useState<WalletName>();

  const onConnectProvider = (walletName: WalletName) => {
    setSelectedWallet(walletName);
    if (connectProvider) {
      void connectProvider(walletName);
    }
  };

  useEffect(() => {
    if (account.status === "failed") {
      setSelectedWallet(undefined);
    }
    if (account.status === "successful") {
      const routerState = routerStateParser.safeParse(state);

      if (routerState.success) {
        navigate(routerState.data.redirectUrl);
      } else {
        navigate(routes.home.path);
      }
    }
  }, [account, state, navigate]);

  return (
    <>
      <PolygonHermezLogo className={classes.logo} />
      <Typography type="body1" className={classes.appName}>
        Bridge
      </Typography>
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
            <Typography type="h1" className={`${classes.cardHeader} ${classes.cardHeaderCentered}`}>
              Connecting to
            </Typography>
            <AccountLoader selectedWallet={selectedWallet} />
          </>
        )}
      </Card>
    </>
  );
};

export default Login;
