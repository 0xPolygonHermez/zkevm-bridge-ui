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
  const walletsData = [
    {
      name: "MetaMask",
      description: "Connect using web wallet",
      Icon: MetaMaskIcon,
      iconContainerClassName: classes.metaMaskIconContainer,
    },
    {
      name: "Walletconnect",
      description: "Connect using mobile wallet",
      Icon: WalletConnectIcon,
      iconContainerClassName: classes.walletConnectIconContainer,
    },
  ];

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
          {walletsData.map(({ name, description, Icon, iconContainerClassName }, i) => (
            <li key={i} className={classes.wallet}>
              <div className={classes.walletInfo}>
                <div className={`${classes.walletIconContainer} ${iconContainerClassName}`}>
                  <Icon />
                </div>
                <div>
                  <Typography type="body1" className={classes.walletName}>
                    {name}
                  </Typography>
                  <Typography type="body2">{description}</Typography>
                </div>
              </div>
              <CaretRightIcon />
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
};

export default Login;
