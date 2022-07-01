import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useHeaderStyles = createUseStyles((theme: Theme) => ({
  header: {
    width: "100%",
    maxWidth: theme.maxWidth,
    display: "flex",
    alignItems: "center",
    margin: [theme.spacing(2), "auto"],
  },
  logoWrapper: {
    flex: 1,
    alignItems: "center",
    textAlign: "center",
    flexDirection: "column",
  },
  appName: {
    marginTop: theme.spacing(0.5),
    color: theme.palette.black,
  },
  link: {
    display: "flex",
    alignItems: "center",
    padding: [theme.spacing(0.75), theme.spacing(1)],
    borderRadius: 8,
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
  settingsLabel: {
    display: "none",
    [theme.breakpoints.upSm]: {
      display: "block",
      marginLeft: theme.spacing(1),
    },
  },
  activityLabel: {
    display: "none",
    [theme.breakpoints.upSm]: {
      display: "block",
      marginRight: theme.spacing(1),
    },
  },
}));

export default useHeaderStyles;
