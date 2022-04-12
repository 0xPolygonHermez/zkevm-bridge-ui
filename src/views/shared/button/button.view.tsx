import { FC } from "react";
import useButtonStyles from "src/views/shared/button/button.styles";

interface ButtonProps {
  onClick?: () => void;
  type?: "submit";
}

const Button: FC<ButtonProps> = ({ children, onClick, type }) => {
  const classes = useButtonStyles();

  return (
    <button className={classes.button} onClick={onClick} type={type}>
      {children}
    </button>
  );
};

export default Button;
