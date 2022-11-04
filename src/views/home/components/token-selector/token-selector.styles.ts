import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenSelectorStyles = createUseStyles((theme: Theme) => ({
  background: {
    background: theme.palette.transparency,
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: [0, theme.spacing(1)],
  },
  card: {
    width: "100%",
    maxWidth: 500,
    height: 511,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
}));

export default useTokenSelectorStyles;
