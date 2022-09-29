import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useSnackbarStyles = createUseStyles((theme: Theme) => ({
  root: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: theme.spacing(3),
    width: "100%",
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.palette.black,
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
    borderRadius: 16,
    width: "90%",
    margin: "0 auto",
    maxWidth: "644px",
  },
  message: {
    whiteSpace: "break-spaces",
    lineHeight: "24px",
    margin: [0, theme.spacing(1.5)],
    color: theme.palette.white,
    flex: 1,
  },
  messageIcon: {
    width: 24,
    height: 24,
  },
  closeButton: {
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    marginLeft: theme.spacing(2.5),
    padding: theme.spacing(1),
  },
  closeIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
    "& rect": {
      fill: theme.palette.white,
    },
  },
  reportButton: {
    color: theme.palette.white,
    backgroundColor: theme.palette.grey.veryDark,
    border: 0,
    borderRadius: 12,
    padding: `${theme.spacing(0.5)}px ${theme.spacing(2)}px`,
    cursor: "pointer",
  },
}));

export default useSnackbarStyles;
