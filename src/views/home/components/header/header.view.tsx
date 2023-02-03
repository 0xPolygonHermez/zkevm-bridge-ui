import { FC } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as ClockIcon } from "src/assets/icons/clock.svg";
import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { useEnvContext } from "src/contexts/env.context";
import { routes } from "src/routes";
import { areSettingsVisible } from "src/utils/feature-toggles";
import { useHeaderStyles } from "src/views/home/components/header/header.styles";
import { NetworkSelector } from "src/views/shared/network-selector/network-selector.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const Header: FC = () => {
  const classes = useHeaderStyles();
  const env = useEnvContext();

  if (!env) {
    return null;
  }

  return (
    <header className={classes.header}>
      <div className={`${classes.block} ${classes.leftBlock}`}>
        {areSettingsVisible(env) && (
          <Link className={classes.link} title="Settings" to={routes.settings.path}>
            <SettingIcon />
          </Link>
        )}
        <Link className={classes.link} to={routes.activity.path}>
          <ClockIcon />
          <Typography className={classes.activityLabel} type="body1">
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
