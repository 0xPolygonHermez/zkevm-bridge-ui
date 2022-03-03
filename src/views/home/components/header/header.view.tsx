import { Link } from "react-router-dom";

import { ReactComponent as Logo } from "src/assets/hermez-logo.svg";
import { ReactComponent as Settings } from "src/assets/icons/settings.svg";
import { ReactComponent as QR } from "src/assets/icons/qr.svg";
import useHeaderHomeStyles from "src/views/home/components/header/header.styles";

const Header = () => {
  const classes = useHeaderHomeStyles();
  return (
    <header className={classes.header}>
      <div className={classes.settingsBtn}>
        <Link to={"/"}>
          <Settings />
          <p>Settings</p>
        </Link>
      </div>
      <div className={classes.logo}>
        <Logo />
        <p>Bridge</p>
      </div>
      <div className={classes.myAccountBtn}>
        <Link to={"/"}>
          <p>My Address</p>
          <QR />
        </Link>
      </div>
    </header>
  );
};

export default Header;
