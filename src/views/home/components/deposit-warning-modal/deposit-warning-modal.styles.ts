import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useDepositWarningModalStyles = createUseStyles((theme: Theme) => ({
  aboveDepositLimitWarningText: {
    lineHeight: "24px",
    margin: [theme.spacing(2), 0, theme.spacing(4)],
    textAlign: "center",
  },
  background: {
    alignItems: "flex-start",
    background: theme.palette.transparency,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    width: "100%",
  },
  cancelButton: {
    "&:hover": {
      color: theme.palette.black,
    },
    background: "transparent",
    border: 0,
    color: theme.palette.grey.dark,
    cursor: "pointer",
    margin: [theme.spacing(1), "auto", theme.spacing(-1), "auto"],
    padding: theme.spacing(1),
    transition: theme.hoverTransition,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(30),
    maxWidth: 510,
    padding: theme.spacing(4),
    width: "100%",
  },
  confirmationWarningText: {
    lineHeight: "24px",
    margin: [theme.spacing(2), 0],
    textAlign: "center",
  },
  exampleText: {
    userSelect: "none",
  },
  link: {
    "&:hover": {
      color: theme.palette.primary.dark,
    },
    color: theme.palette.primary.main,
    transition: theme.hoverTransition,
  },
  title: {
    marginBottom: theme.spacing(1),
    textAlign: "center",
  },
}));
