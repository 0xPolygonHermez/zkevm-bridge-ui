import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useConfirmPopUpStyles = createUseStyles((theme: Theme) => ({
  background: {
    alignItems: "center",
    background: theme.palette.transparency,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    padding: [theme.spacing(1), theme.spacing(5)],
  },
  buttonsBox: {
    display: "flex",
    justifyContent: "space-around",
  },
  cancelButton: {
    "&:hover": {
      background: theme.palette.grey.light,
    },
    backgroundColor: theme.palette.grey.main,
    color: theme.palette.grey.dark,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    maxWidth: 500,
    padding: theme.spacing(3),
    width: "100%",
  },
  confirmButton: {
    "&:hover": {
      background: theme.palette.primary.dark,
    },
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.white,
  },
  text: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    textAlign: "center",
  },
}));
