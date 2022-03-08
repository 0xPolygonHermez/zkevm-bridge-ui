import { FC } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as BackIcon } from "src/assets/icons/back.svg";
import { ReactComponent as CloseIcon } from "src/assets/icons/close.svg";
import useHeaderStyles from "src/views/shared/header/header.styles";
import Typography from "src/views/shared/typography/typography.view";

interface HeaderProps {
  title: string;
  close?: boolean;
}

const Header: FC<HeaderProps> = ({ title, close }) => {
  const classes = useHeaderStyles();
  return (
    <header className={classes.header}>
      <Link to="/" className={classes.sideButton}>
        <BackIcon className={classes.icon} />
      </Link>
      <Typography type={"h1"} className={classes.title}>
        {title}
      </Typography>
      <Link to="/" className={classes.sideButton}>
        {close && <CloseIcon className={classes.icon} />}
      </Link>
    </header>
  );
};

export default Header;
