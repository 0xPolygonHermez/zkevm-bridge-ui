import { FC } from "react";

import useErrorStyles from "src/views/shared/error/error.styles";
import Typography from "src/views/shared/typography/typography.view";

interface ErrorProps {
  error: string;
  type?: "body1" | "body2";
}

const Error: FC<ErrorProps> = ({ error, type = "body1" }) => {
  const classes = useErrorStyles();
  return (
    <Typography type={type} className={classes.error}>
      {error}
    </Typography>
  );
};

export default Error;
