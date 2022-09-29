import { Link } from "react-router-dom";
import { FC } from "react";

import { ReactComponent as PolygonZkEVMLogo } from "src/assets/polygon-zkevm-logo.svg";
import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
import { ReactComponent as ClockIcon } from "src/assets/icons/clock.svg";
import useHeaderStyles from "src/views/home/components/header/header.styles";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";

const Header: FC = () => {
  const classes = useHeaderStyles();
  return (
    <header className={classes.header}>
      <Link to={routes.settings.path} className={classes.link}>
        <SettingIcon />
        <Typography type="body1" className={classes.settingsLabel}>
          Settings
        </Typography>
      </Link>
      <div className={classes.logoWrapper}>
        <PolygonZkEVMLogo />
      </div>
      <Link to={routes.activity.path} className={classes.link}>
        <Typography type="body1" className={classes.activityLabel}>
          Activity
        </Typography>
        <ClockIcon />
      </Link>
    </header>
  );
};

export default Header;
