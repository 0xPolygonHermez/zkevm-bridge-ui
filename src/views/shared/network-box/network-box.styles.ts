import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useNetworkBoxStyles = createUseStyles((theme: Theme) => ({
  networkBox: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  caretUp: {
    transform: "rotate(180deg)",
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
