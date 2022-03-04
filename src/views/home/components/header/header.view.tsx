import { Link } from "react-router-dom";

import { ReactComponent as Logo } from "src/assets/hermez-logo.svg";
import { ReactComponent as SettingsIcon } from "src/assets/icons/settings.svg";
import { ReactComponent as QRIcon } from "src/assets/icons/qr.svg";
import useHeaderStyles from "src/views/home/components/header/header.styles";

const Header = () => {
  const classes = useHeaderStyles();
  return (
    <header className={classes.header}>
      <div className={classes.settingsButton}>
        <Link to={"/"} className={classes.button}>
          <SettingsIcon className={classes.icon} />
          <p className={classes.text}>Settings</p>
        </Link>
      </div>
      <div className={classes.logoBox}>
        <Logo className={classes.logoIcon} />
        <p className={classes.logoText}>Bridge</p>
      </div>
      <div className={classes.myAccountButton}>
        <Link to={"/"} className={classes.button}>
          <p className={classes.text}>My Address</p>
          <QRIcon className={classes.icon} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
