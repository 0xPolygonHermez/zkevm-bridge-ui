import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useHeaderStyles = createUseStyles((theme: Theme) => ({
  header: {
    width: "100%",
    maxWidth: theme.maxWidth,
    display: "flex",
    margin: [theme.spacing(3), "auto"],
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideButton: {
    width: theme.spacing(5),
  },
  icon: {
    width: "100%",
    height: theme.spacing(5),
    padding: theme.spacing(1.25),
    backgroundColor: theme.palette.white,
    borderRadius: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer ",
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
}));

export default useHeaderStyles;
