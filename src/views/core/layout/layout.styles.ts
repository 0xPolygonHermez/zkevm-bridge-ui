import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useLayoutStyles = createUseStyles((theme: Theme) => ({
  layout: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: theme.palette.grey.light,
  },
  container: {
    width: "100%",
    flex: 1,
    margin: [0, "auto"],
    paddingBottom: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
}));

export default useLayoutStyles;
