import { ReactElement, FC } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as CloseIcon } from "src/assets/icons/xmark.svg";
import routes from "src/routes";
import useHeaderStyles from "src/views/shared/header/header.styles";
import Typography from "src/views/shared/typography/typography.view";
import { RouterState } from "src/domain";

interface HeaderProps {
  title: string;
  backTo: { routeKey: keyof typeof routes; state?: RouterState };
  Subtitle?: ReactElement;
}

const Header: FC<HeaderProps> = ({ title, backTo, Subtitle }) => {
  const classes = useHeaderStyles();
  const route = routes[backTo.routeKey].path;

  return (
    <header className={classes.header}>
      <div className={classes.titleWrapper}>
        <Typography type="h1">{title}</Typography>
        <Link to={route} state={backTo.state} className={classes.sideButton}>
          <CloseIcon className={classes.icon} />
        </Link>
      </div>
      {Subtitle && <div className={classes.subtitleWrapper}>{Subtitle}</div>}
    </header>
  );
};

export default Header;
