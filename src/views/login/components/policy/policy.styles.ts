import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const usePolicyStyles = createUseStyles((theme: Theme) => ({
  background: {
    background: theme.palette.transparency,
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 500,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(3),
    gap: theme.spacing(3),
  },
  buttonsBox: {
    display: "flex",
    justifyContent: "space-around",
  },
  button: {
    border: "none",
    borderRadius: theme.spacing(1),
    cursor: "pointer",
    padding: [theme.spacing(1), theme.spacing(5)],
  },
  cancelButton: {
    color: theme.palette.grey.dark,
    backgroundColor: theme.palette.grey.main,
    "&:hover": {
      background: theme.palette.grey.light,
    },
  },
  connectButton: {
    color: theme.palette.white,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      background: theme.palette.primary.dark,
    },
  },
}));

export default usePolicyStyles;
