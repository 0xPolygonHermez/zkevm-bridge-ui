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
import routes from "src/routes";
import { WalletName } from "src/domain";
import { routerStateParser } from "src/adapters/browser";

const Login: FC = () => {
  const classes = useLoginStyles();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { connectProvider, account } = useProvidersContext();
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

  return (
    <div className={classes.contentWrapper}>
      <PolygonZkEVMLogo className={classes.logo} />
      <Typography type="body1" className={classes.appName}>
        Bridge
      </Typography>
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
  );
};

export default Login;
