import { FC } from "react";

import useErrorMessageStyles from "src/views/shared/error-message/error-message.styles";
import Typography from "src/views/shared/typography/typography.view";

interface ErrorMessageProps {
  className?: string;
  error: string;
  type?: "body1" | "body2";
}

const ErrorMessage: FC<ErrorMessageProps> = ({ className, error, type = "body1" }) => {
  const classes = useErrorMessageStyles();

  return (
    <Typography className={`${classes.error} ${className || ""}`} type={type}>
      {error}
    </Typography>
  );
};

export default ErrorMessage;
