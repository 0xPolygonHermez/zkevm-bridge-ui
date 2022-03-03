import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const flexBox = { width: "100%", display: "flex" };
const btn = (theme: Theme) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: [[theme.spacing(0.75), theme.spacing(1)]],
  borderRadius: theme.spacing(1),
  height: theme.spacing(4.5),
  "& svg": {
    width: 24,
  },
  "& p": {
    margin: [[0, theme.spacing(1)]],
    display: "none",
  },
  "&:hover": {
    backgroundColor: theme.palette.grey.light,
  },
  [theme.breakpoints.upSm]: {
    "& p": {
      display: "inherit",
    },
  },
});

const useHeaderHomeStyles = createUseStyles((theme: Theme) => ({
  header: {
    ...flexBox,
    justifyContent: "space-between",
    fontWeight: theme.fontWeights.medium,
    "& > *": {
      width: "100%",
    },
  },
  settingsBtn: {
    ...flexBox,
    alignItems: "center",
    "& a": {
      ...btn(theme),
    },
  },
  myAccountBtn: {
    ...flexBox,
    alignItems: "center",
    justifyContent: "right",
    "& a": {
      ...btn(theme),
    },
  },
  logo: {
    alignItems: "center",
    textAlign: "center",
    flexDirection: "column",
    "& svg": {
      width: 43,
    },
    "& p": {
      marginTop: -theme.spacing(1.5),
      fontSize: theme.spacing(1.75),
    },
  },
}));

export default useHeaderHomeStyles;
