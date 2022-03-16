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
    padding: theme.spacing(1),
    borderRadius: theme.spacing(2),
    width: "90%",
    margin: "0 auto",
    maxWidth: "644px",
  },
  message: {
    textAlign: "center",
    color: theme.palette.white,
    flex: 1,
  },
  closeButton: {
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  reportButton: {
    textTransform: "uppercase",
    color: theme.palette.white,
    border: "2px solid",
    backgroundColor: "transparent",
    margin: `0 ${theme.spacing(1)}px`,
    lineHeight: "14px",
    padding: theme.spacing(1),
    cursor: "pointer",
    "&:hover:not(:disabled)": {
      background: "transparent",
    },
  },
}));

export default useSnackbarStyles;
