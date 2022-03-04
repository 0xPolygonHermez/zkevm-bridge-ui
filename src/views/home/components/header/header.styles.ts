import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useHeaderStyles = createUseStyles((theme: Theme) => ({
  header: {
    display: "flex",
    fontWeight: theme.fontWeights.medium,
  },
  settingsButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  myAccountButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "right",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    padding: [[theme.spacing(0.75), theme.spacing(1)]],
    borderRadius: theme.spacing(1),
    height: theme.spacing(4.5),
    "&:hover": {
      backgroundColor: theme.palette.grey.light,
    },
  },
  icon: {
    width: 24,
  },
  text: {
    margin: [[0, theme.spacing(1)]],
    display: "none",
    [theme.breakpoints.upSm]: {
      display: "inherit",
    },
  },
  logoBox: {
    flex: 1,
    alignItems: "center",
    textAlign: "center",
    flexDirection: "column",
  },
  logoIcon: {
    width: 43,
  },
  logoText: {
    marginTop: -theme.spacing(1.5),
    fontSize: theme.spacing(1.75),
  },
}));

export default useHeaderStyles;
