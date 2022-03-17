import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Card from "src/views/shared/card/card.view";
import useLoginStyles from "src/views/login/login.styles";
import Typography from "src/views/shared/typography/typography.view";
import Error from "src/views/shared/error/error.view";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { ReactComponent as WalletConnectIcon } from "src/assets/icons/walletconnect.svg";
import { ReactComponent as CaretRightIcon } from "src/assets/icons/caret-right.svg";
import { ReactComponent as PolygonHermezLogo } from "src/assets/polygon-hermez-logo.svg";
import { useEthereumProviderContext } from "src/contexts/ethereum-provider.context";
import { WalletName } from "src/domain";
import routes from "src/routes";

const Login: FC = () => {
  const classes = useLoginStyles();
  const navigate = useNavigate();
  const { connectProvider, account } = useEthereumProviderContext();

  const onConnectProvider = (walletName: WalletName) => {
    if (connectProvider) {
      void connectProvider(walletName);
    }
  };

  useEffect(() => {
    if (account.status === "successful") {
      navigate(routes.home.path);
    }
  }, [account, navigate]);

  return (
    <>
      <PolygonHermezLogo className={classes.logo} />
      <Typography type="body1" className={classes.appName}>
        Bridge
      </Typography>
      <div className={classes.cardWrap}>
        <Card className={classes.card}>
          <Typography type="h1" className={classes.cardHeader}>
            Connect a wallet
          </Typography>
          <ul className={classes.walletList}>
            <li
              className={classes.wallet}
              role="button"
              onClick={() => onConnectProvider(WalletName.METAMASK)}
            >
              <div className={classes.walletInfo}>
                <div className={`${classes.walletIconContainer} ${classes.metaMaskIconContainer}`}>
                  <MetaMaskIcon />
                </div>
                <div>
                  <Typography type="body1" className={classes.walletName}>
                    MetaMask
                  </Typography>
                  <Typography type="body2">Connect using web wallet</Typography>
                </div>
              </div>
              <CaretRightIcon />
            </li>
            <li
              className={classes.wallet}
              role="button"
              onClick={() => onConnectProvider(WalletName.WALLET_CONNECT)}
            >
              <div className={classes.walletInfo}>
                <div
                  className={`${classes.walletIconContainer} ${classes.walletConnectIconContainer}`}
                >
                  <WalletConnectIcon />
                </div>
                <div>
                  <Typography type="body1" className={classes.walletName}>
                    WalletConnect
                  </Typography>
                  <Typography type="body2">Connect using mobile wallet</Typography>
                </div>
              </div>
              <CaretRightIcon />
            </li>
          </ul>
        </Card>
        {account.status === "failed" && <Error error={account.error} />}
      </div>
    </>
  );
};

export default Login;
