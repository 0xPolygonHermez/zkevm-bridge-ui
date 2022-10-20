import { FC } from "react";

import useErrorMessageStyles from "src/views/shared/error-message/error-message.styles";
import Typography from "src/views/shared/typography/typography.view";

interface ErrorMessageProps {
  error: string;
  type?: "body1" | "body2";
  className?: string;
}

const ErrorMessage: FC<ErrorMessageProps> = ({ error, className, type = "body1" }) => {
  const classes = useErrorMessageStyles();

  return (
    <Typography type={type} className={`${classes.error} ${className || ""}`}>
      {error}
    </Typography>
  );
};

export default ErrorMessage;
