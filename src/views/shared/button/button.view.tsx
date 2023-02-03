import { FC, PropsWithChildren } from "react";

import { useButtonStyles } from "src/views/shared/button/button.styles";
import { Spinner } from "src/views/shared/spinner/spinner.view";

type ButtonProps = PropsWithChildren<{
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  type?: "submit";
}>;

export const Button: FC<ButtonProps> = ({ children, disabled, isLoading, onClick, type }) => {
  const addSpinnerSpacing = children !== undefined;
  const classes = useButtonStyles();

  return (
    <button
      className={classes.button}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {children}
      {isLoading && (
        <span className={addSpinnerSpacing ? classes.paddedSpinner : ""}>
          <Spinner color="#fff" size={24} />
        </span>
      )}
    </button>
  );
};
