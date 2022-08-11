import { FC, PropsWithChildren } from "react";

import useButtonStyles from "src/views/shared/button/button.styles";
import Spinner from "src/views/shared/spinner/spinner.view";

type ButtonProps = PropsWithChildren<{
  onClick?: () => void;
  type?: "submit";
  disabled?: boolean;
  isLoading?: boolean;
}>;

const Button: FC<ButtonProps> = ({ children, type, disabled, isLoading, onClick }) => {
  const classes = useButtonStyles({ addSpinnerSpacing: children !== undefined });

  return (
    <button
      className={classes.button}
      onClick={onClick}
      type={type}
      disabled={disabled || isLoading}
    >
      {children}
      {isLoading && (
        <span className={classes.spinner}>
          <Spinner size={24} color="#fff" />
        </span>
      )}
    </button>
  );
};

export default Button;
