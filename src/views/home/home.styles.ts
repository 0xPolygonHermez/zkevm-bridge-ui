import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useHomeStyles = createUseStyles((theme: Theme) => ({
  contentWrapper: {
    display: "flex",
    flexDirection: "column",
    padding: [0, theme.spacing(2)],
  },
  ethereumAddress: {
    alignItems: "center",
    backgroundColor: theme.palette.grey.main,
    borderRadius: 56,
    display: "flex",
    margin: [theme.spacing(3), "auto", theme.spacing(3)],
    padding: [theme.spacing(1.25), theme.spacing(3)],
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(3), "auto", theme.spacing(5)],
    },
  },
  metaMaskIcon: {
    marginRight: theme.spacing(1),
    width: 20,
  },
  networkBoxWrapper: {
    margin: [0, "auto", theme.spacing(3)],
    maxWidth: theme.maxWidth,
    width: "100%",
  },
}));
