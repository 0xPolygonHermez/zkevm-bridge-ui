import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useLayoutStyles = createUseStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    margin: [0, "auto"],
    paddingBottom: theme.spacing(2),
    width: "100%",
  },
  layout: {
    background: theme.palette.grey.light,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
  },
  linkContainer: {
    marginTop: theme.spacing(2),
  },
}));
