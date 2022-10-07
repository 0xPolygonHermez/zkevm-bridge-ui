import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useNetworkBoxStyles = createUseStyles((theme: Theme) => ({
  networkBox: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  actionButton: {
    borderRadius: 48,
    display: "flex",
    alignItems: "center",
    appearance: "none",
    padding: theme.spacing(0.5),
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transition: theme.hoverTransition,
    "&:hover": {
      background: theme.palette.grey.light,
    },
  },
  listItem: {
    padding: [theme.spacing(0.25), 0],
  },
  metaMaskButton: {
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    appearance: "none",
    padding: [theme.spacing(1), theme.spacing(1.5)],
    border: "none",
    background: theme.palette.grey.light,
    cursor: "pointer",
    transition: theme.hoverTransition,
    "&:hover": {
      background: theme.palette.grey.main,
    },
    "&:disabled": {
      cursor: "inherit",
      background: theme.palette.white,
      border: `1px solid ${theme.palette.grey.light}`,
    },
  },
  metaMaskIcon: {
    width: 20,
    marginRight: theme.spacing(1),
  },
  link: {
    color: theme.palette.primary.dark,
  },
}));

export default useNetworkBoxStyles;
