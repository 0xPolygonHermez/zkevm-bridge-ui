import { Link } from "react-router-dom";
import { FC } from "react";

import { ReactComponent as PolygonHermezIcon } from "src/assets/icons/polygon-hermez.svg";
import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
import { ReactComponent as ClockIcon } from "src/assets/icons/clock.svg";
import useHeaderStyles from "src/views/home/components/header/header.styles";
import Typography from "src/views/shared/typography/typography.view";

const Header: FC = () => {
  const classes = useHeaderStyles();
  return (
    <header className={classes.header}>
      <Link to="/settings" className={classes.link}>
        <SettingIcon />
        <Typography type="body1" className={classes.settingsLabel}>
          Settings
        </Typography>
      </Link>
      <div className={classes.logoWrapper}>
        <PolygonHermezIcon />
        <Typography type="body2" className={classes.appName}>
          Bridge
        </Typography>
      </div>
      <Link to="/activity" className={classes.link}>
        <Typography type="body1" className={classes.activityLabel}>
          Activity
        </Typography>
        <ClockIcon />
      </Link>
    </header>
  );
};

export default Header;
