import { FC } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as CloseIcon } from "src/assets/icons/xmark.svg";
import routes from "src/routes";
import useHeaderStyles from "src/views/shared/header/header.styles";
import Typography from "src/views/shared/typography/typography.view";

interface HeaderProps {
  title: string;
  backTo: keyof typeof routes;
}

const Header: FC<HeaderProps> = ({ title, backTo }) => {
  const classes = useHeaderStyles();
  const route = routes[backTo].path;

  return (
    <header className={classes.header}>
      <div className={classes.sideButton} />
      <Typography type="h1">{title}</Typography>
      <Link to={route} className={classes.sideButton}>
        <CloseIcon className={classes.icon} />
      </Link>
    </header>
  );
};

export default Header;
