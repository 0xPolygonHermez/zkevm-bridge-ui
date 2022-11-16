import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useNetworkBoxStyles = createUseStyles((theme: Theme) => ({
  button: {
    "&:disabled": {
      cursor: "inherit",
      opacity: 0.75,
    },
    "&:hover:not(:disabled)": {
      background: theme.palette.grey.main,
    },
    alignItems: "center",
    appearance: "none",
    background: theme.palette.grey.light,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    padding: [theme.spacing(1), theme.spacing(1.5)],
    transition: theme.hoverTransition,
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
    width: 20,
  },
  buttons: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(4),
  },
  link: {
    color: theme.palette.primary.dark,
  },
  listItem: {
    padding: [theme.spacing(0.25), 0],
  },
  networkBox: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
}));

export default useNetworkBoxStyles;
