import { ReactElement, FC } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as ArrowLeftIcon } from "src/assets/icons/arrow-left.svg";
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
        <Link to={route} state={backTo.state} className={classes.sideButton}>
          <ArrowLeftIcon className={classes.icon} />
        </Link>
        <Typography type="h1">{title}</Typography>
      </div>
      {Subtitle && <div className={classes.subtitleWrapper}>{Subtitle}</div>}
    </header>
  );
};

export default Header;
