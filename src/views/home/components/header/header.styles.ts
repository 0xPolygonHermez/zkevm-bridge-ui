import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useHeaderStyles = createUseStyles((theme: Theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(2),
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
  settingsIcon: {
    marginRight: theme.spacing(1),
  },
  activityIcon: {
    marginLeft: theme.spacing(1),
  },
  link: {
    display: "flex",
    alignItems: "center",
    padding: [theme.spacing(0.75), theme.spacing(1)],
    borderRadius: theme.spacing(1),
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
}));

export default useHeaderStyles;
