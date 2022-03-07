import { Link } from "react-router-dom";

import { ReactComponent as PolygonHermezIcon } from "src/assets/icons/polygon-hermez.svg";
import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
import { ReactComponent as ClockIcon } from "src/assets/icons/clock.svg";
import useHeaderStyles from "src/views/home/components/header/header.styles";
import Typography from "src/views/shared/typography/typography.view";

const Header = () => {
  const classes = useHeaderStyles();
  return (
    <header className={classes.header}>
      <Link to={"/"} className={classes.link}>
        <SettingIcon className={classes.settingsIcon} />
        <Typography type="body1">Settings</Typography>
      </Link>
      <div className={classes.logoWrapper}>
        <PolygonHermezIcon />
        <Typography type="body2" className={classes.appName}>
          Bridge
        </Typography>
      </div>
      <Link to={"/"} className={classes.link}>
        <Typography type="body1">Activity</Typography>
        <ClockIcon className={classes.activityIcon} />
      </Link>
    </header>
  );
};

export default Header;
