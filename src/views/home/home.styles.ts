import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useHomeStyles = createUseStyles((theme: Theme) => ({
  ethereumAddress: {
    display: "flex",
    alignItems: "center",
    margin: [theme.spacing(2), "auto", theme.spacing(3)],
    backgroundColor: theme.palette.grey.main,
    padding: [theme.spacing(1.25), theme.spacing(3)],
    borderRadius: 56,
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(3), "auto", theme.spacing(5)],
    },
  },
  metaMaskIcon: {
    width: 20,
    marginRight: theme.spacing(1),
  },
  contentWrapper: {
    padding: [0, theme.spacing(2)],
    display: "flex",
    flexDirection: "column",
  },
}));

export default useHomeStyles;
