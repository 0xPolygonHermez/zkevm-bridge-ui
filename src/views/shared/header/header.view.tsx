import { FC } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ReactComponent as BackIcon } from "src/assets/icons/arrow-left.svg";
import { ReactComponent as CloseIcon } from "src/assets/icons/xmark.svg";
import useHeaderStyles from "src/views/shared/header/header.styles";
import Typography from "src/views/shared/typography/typography.view";

interface HeaderProps {
  title: string;
  onClose?: boolean;
}

const Header: FC<HeaderProps> = ({ title, onClose }) => {
  const classes = useHeaderStyles();
  const navigate = useNavigate();

  return (
    <header className={classes.header}>
      <div onClick={() => navigate(-1)} className={classes.sideButton}>
        <BackIcon className={classes.icon} />
      </div>
      <Typography type="h1">{title}</Typography>
      <Link to="/" className={classes.sideButton}>
        {onClose && <CloseIcon className={classes.icon} />}
      </Link>
    </header>
  );
};

export default Header;
