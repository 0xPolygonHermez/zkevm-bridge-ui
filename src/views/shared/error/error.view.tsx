import { FC } from "react";

import useErrorStyles from "src/views/shared/error/error.styles";
import Typography from "src/views/shared/typography/typography.view";

interface ErrorProps {
  error: string;
}

const Error: FC<ErrorProps> = ({ error }) => {
  const classes = useErrorStyles();
  return (
    <Typography type="body1" className={classes.error}>
      {error}
    </Typography>
  );
};

export default Error;
