import { FC } from "react";
import useButtonStyles from "src/views/shared/button/button.styles";

interface ButtonProps {
  onClick: () => void;
}

const Button: FC<ButtonProps> = ({ children, onClick }) => {
  const classes = useButtonStyles();

  return (
    <button className={classes.button} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
