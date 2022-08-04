import { FC, PropsWithChildren } from "react";
import useButtonStyles from "src/views/shared/button/button.styles";

type ButtonProps = PropsWithChildren<{
  onClick?: () => void;
  type?: "submit";
  disabled?: boolean;
}>;

const Button: FC<ButtonProps> = ({ children, onClick, type, disabled }) => {
  const classes = useButtonStyles();

  return (
    <button className={classes.button} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
