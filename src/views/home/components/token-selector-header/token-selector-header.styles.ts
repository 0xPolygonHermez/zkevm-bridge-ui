import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenSelectorHeaderStyles = createUseStyles((theme: Theme) => ({
  backButton: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
    alignItems: "center",
    background: theme.palette.grey.light,
    border: 0,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    height: theme.spacing(4),
    justifyContent: "center",
    left: 0,
    padding: 0,
    position: "absolute",
    transition: theme.hoverTransition,
    width: theme.spacing(4),
  },
  backButtonIcon: {
    height: 16,
    width: 16,
  },
  closeButton: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
    alignItems: "center",
    background: theme.palette.grey.light,
    border: 0,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    height: theme.spacing(4),
    justifyContent: "center",
    padding: 0,
    position: "absolute",
    right: 0,
    transition: theme.hoverTransition,
    width: theme.spacing(4),
  },
  closeButtonIcon: {
    height: 16,
    width: 16,
  },
  tokenSelectorHeader: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(1),
    padding: [theme.spacing(0.5), 0],
    position: "relative",
  },
}));
