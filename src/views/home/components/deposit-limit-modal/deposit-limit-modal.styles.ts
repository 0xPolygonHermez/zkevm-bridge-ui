import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useDepositLimitModalStyles = createUseStyles((theme: Theme) => ({
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
  exampleText: {
    userSelect: "none",
  },
  forbiddenText: {
    lineHeight: "24px",
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  title: {
    marginBottom: theme.spacing(1),
    textAlign: "center",
  },
  warningText: {
    lineHeight: "24px",
    margin: [theme.spacing(2), 0],
    textAlign: "center",
  },
}));
