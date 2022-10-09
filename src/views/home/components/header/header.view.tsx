import { FC } from "react";
import { Link } from "react-router-dom";

import { areSettingsVisible } from "src/constants";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
import { ReactComponent as ClockIcon } from "src/assets/icons/clock.svg";
import useHeaderStyles from "src/views/home/components/header/header.styles";
import Typography from "src/views/shared/typography/typography.view";
import NetworkSelector from "src/views/shared/network-selector/network-selector.view";
import routes from "src/routes";
import { useEnvContext } from "src/contexts/env.context";

const Header: FC = () => {
  const classes = useHeaderStyles();
  const env = useEnvContext();

  if (!env) {
    return null;
  }

  return (
    <header className={classes.header}>
      <div className={`${classes.block} ${classes.leftBlock}`}>
        {areSettingsVisible(env) && (
          <Link title="Settings" to={routes.settings.path} className={classes.link}>
            <SettingIcon />
          </Link>
        )}
        <Link to={routes.activity.path} className={classes.link}>
          <ClockIcon />
          <Typography type="body1" className={classes.activityLabel}>
            Activity
          </Typography>
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
