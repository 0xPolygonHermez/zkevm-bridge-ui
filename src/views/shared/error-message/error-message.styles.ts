import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useErrorMessageStyles = createUseStyles((theme: Theme) => ({
  error: {
    color: theme.palette.error.main,
    lineHeight: "26px",
    textAlign: "center",
    whiteSpace: "break-spaces",
  },
}));

export default useErrorMessageStyles;
