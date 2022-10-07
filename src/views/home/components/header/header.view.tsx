import { FC } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
import { ReactComponent as ClockIcon } from "src/assets/icons/clock.svg";
import useHeaderStyles from "src/views/home/components/header/header.styles";
import NetworkSelector from "src/views/shared/network-selector/network-selector.view";
import routes from "src/routes";

const Header: FC = () => {
  const classes = useHeaderStyles();

  return (
    <header className={classes.header}>
      <div className={`${classes.block} ${classes.leftBlock}`}>
        <Link title="Activity" to={routes.activity.path} className={classes.link}>
          <ClockIcon />
        </Link>
        <Link title="Settings" to={routes.settings.path} className={classes.link}>
          <SettingIcon />
        </Link>
      </div>
      <div className={`${classes.block} ${classes.centerBlock}`}>
        <PolygonZkEVMLogo className={classes.logo} />
      </div>
      <div className={`${classes.block} ${classes.rightBlock}`}>
        <NetworkSelector />
      </div>
    </header>
  );
};

export default Header;
