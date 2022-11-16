import { FC, PropsWithChildren } from "react";

import useButtonStyles from "src/views/shared/button/button.styles";
import Spinner from "src/views/shared/spinner/spinner.view";

type ButtonProps = PropsWithChildren<{
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  type?: "submit";
}>;

const Button: FC<ButtonProps> = ({ children, disabled, isLoading, onClick, type }) => {
  const classes = useButtonStyles({ addSpinnerSpacing: children !== undefined });

  return (
    <button
      className={classes.button}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {children}
      {isLoading && (
        <span className={classes.spinner}>
          <Spinner color="#fff" size={24} />
        </span>
      )}
    </button>
  );
};

export default Button;
