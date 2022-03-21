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
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    width: "90%",
    margin: "0 auto",
    maxWidth: "644px",
  },
  message: {
    textAlign: "center",
    margin: [0, theme.spacing(1)],
    color: theme.palette.white,
    flex: 1,
  },
  closeButton: {
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    marginLeft: theme.spacing(1),
    height: "20px",
    padding: 0,
  },
  closeIcon: {
    width: "20px",
    height: "20px",
    "& rect": {
      fill: theme.palette.white,
    },
  },
  reportButton: {
    textTransform: "uppercase",
    color: theme.palette.white,
    border: "1px solid",
    backgroundColor: "transparent",
    margin: `0 ${theme.spacing(1)}px`,
    lineHeight: "14px",
    padding: theme.spacing(1),
    cursor: "pointer",
  },
}));

export default useSnackbarStyles;
