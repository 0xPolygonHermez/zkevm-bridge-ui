import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenSelectorStyles = createUseStyles((theme: Theme) => ({
  background: {
    alignItems: "center",
    background: theme.palette.transparency,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    padding: [0, theme.spacing(1)],
    width: "100%",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    height: 515,
    maxWidth: 500,
    padding: theme.spacing(2),
    width: "100%",
  },
}));
