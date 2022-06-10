import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useLayoutStyles = createUseStyles((theme: Theme) => ({
  layout: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: theme.palette.grey.light,
    padding: [0, theme.spacing(2)],
  },
  container: {
    width: "100%",
    maxWidth: 644,
    margin: [0, "auto"],
    display: "flex",
    flexDirection: "column",
  },
}));

export default useLayoutStyles;
