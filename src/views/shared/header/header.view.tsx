import { FC, ReactElement } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as ArrowLeftIcon } from "src/assets/icons/arrow-left.svg";
import { RouterState } from "src/domain";
import { routes } from "src/routes";
import { useHeaderStyles } from "src/views/shared/header/header.styles";
import { NetworkSelector } from "src/views/shared/network-selector/network-selector.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface HeaderProps {
  Subtitle?: ReactElement;
  backTo: { routeKey: keyof typeof routes; state?: RouterState };
  title: string;
}

export const Header: FC<HeaderProps> = ({ backTo, Subtitle, title }) => {
  const classes = useHeaderStyles();
  const route = routes[backTo.routeKey].path;

  return (
    <header className={classes.header}>
      <div className={classes.topRow}>
        <div className={`${classes.block} ${classes.leftBlock}`}>
          <Link className={classes.sideButton} state={backTo.state} to={route}>
            <ArrowLeftIcon className={classes.icon} />
          </Link>
        </div>
        <div className={`${classes.block} ${classes.centerBlock}`}>
          <Typography type="h1">{title}</Typography>
        </div>
        <div className={`${classes.block} ${classes.rightBlock}`}>
          <NetworkSelector />
        </div>
      </div>
      {Subtitle && <div className={classes.bottomRow}>{Subtitle}</div>}
    </header>
  );
};
