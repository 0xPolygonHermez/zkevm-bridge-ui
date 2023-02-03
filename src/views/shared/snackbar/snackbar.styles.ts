import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useSnackbarStyles = createUseStyles((theme: Theme) => ({
  closeButton: {
    "&:hover": {
      background: theme.palette.grey.veryDark,
    },
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    marginLeft: theme.spacing(2.5),
    padding: theme.spacing(0.75),
    transition: theme.hoverTransition,
  },
  closeIcon: {
    "& rect": {
      fill: theme.palette.white,
    },
    alignItems: "center",
    display: "flex",
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  message: {
    color: theme.palette.white,
    flex: 1,
    lineHeight: "24px",
    margin: [0, theme.spacing(1.5)],
    whiteSpace: "break-spaces",
  },
  messageIcon: {
    height: 24,
    width: 24,
  },
  reportButton: {
    "&:hover": {
      backgroundColor: theme.palette.grey.dark,
    },
    backgroundColor: theme.palette.grey.veryDark,
    border: 0,
    borderRadius: 12,
    color: theme.palette.white,
    cursor: "pointer",
    padding: `${theme.spacing(0.5)}px ${theme.spacing(2)}px`,
    transition: theme.hoverTransition,
  },
  root: {
    bottom: theme.spacing(3),
    left: 0,
    position: "fixed",
    right: 0,
    width: "100%",
  },
  wrapper: {
    alignItems: "center",
    background: theme.palette.black,
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    margin: "0 auto",
    maxWidth: "644px",
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
    width: "90%",
  },
}));
