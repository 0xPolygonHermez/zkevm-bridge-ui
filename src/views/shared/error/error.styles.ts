import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useErrorStyles = createUseStyles((theme: Theme) => ({
  error: {
    color: theme.palette.error.main,
    textAlign: "center",
    whiteSpace: "break-spaces",
    lineHeight: "26px",
  },
}));

export default useErrorStyles;
