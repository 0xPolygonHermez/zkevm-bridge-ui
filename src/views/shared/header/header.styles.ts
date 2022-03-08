import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useHeaderStyles = createUseStyles((theme: Theme) => ({
  header: {
    display: "flex",
    margin: [theme.spacing(3), 0],
    alignItems: "center",
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
  title: {
    flex: 1,
    textAlign: "center",
  },
}));

export default useHeaderStyles;
