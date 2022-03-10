import { FC } from "react";

import Card from "src/views/shared/card/card.view";
import useLoginStyles from "src/views/login/login.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { ReactComponent as WalletConnectIcon } from "src/assets/icons/walletconnect.svg";
import Typography from "src/views/shared/typography/typography.view";
import { ReactComponent as CaretRightIcon } from "src/assets/icons/caret-right.svg";
import { ReactComponent as PolygonHermezLogo } from "src/assets/polygon-hermez-logo.svg";

const Login: FC = () => {
  const classes = useLoginStyles();

  return (
    <>
      <PolygonHermezLogo className={classes.logo} />
      <Typography type="body1" className={classes.appName}>
        Bridge
      </Typography>
      <Card className={classes.card}>
        <Typography type="h1" className={classes.cardHeader}>
          Connect a wallet
        </Typography>
        <ul className={classes.walletList}>
          <li className={classes.wallet}>
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
          <li className={classes.wallet}>
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
    </>
  );
};

export default Login;
