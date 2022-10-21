import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useErrorMessageStyles = createUseStyles((theme: Theme) => ({
  error: {
    color: theme.palette.error.main,
    textAlign: "center",
    whiteSpace: "break-spaces",
    lineHeight: "26px",
  },
}));

export default useErrorMessageStyles;
