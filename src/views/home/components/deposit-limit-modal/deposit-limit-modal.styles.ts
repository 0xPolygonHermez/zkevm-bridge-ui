import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useDepositLimitModalStyles = createUseStyles((theme: Theme) => ({
  background: {
    alignItems: "center",
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
    margin: [theme.spacing(1), "auto", 0, "auto"],
    padding: theme.spacing(1),
  },
  card: {
    display: "flex",
    flexDirection: "column",
    maxWidth: 500,
    padding: theme.spacing(3),
    width: "100%",
  },
  exampleText: {
    userSelect: "none",
  },
  forbiddenText: {
    lineHeight: "24px",
    marginBottom: theme.spacing(4),
  },
  input: {
    fontSize: 20,
    fontWeight: 500,
    marginBottom: theme.spacing(4),
    padding: theme.spacing(1),
  },
  title: {
    marginBottom: theme.spacing(1),
    textAlign: "center",
  },
  warningText: {
    lineHeight: "24px",
  },
}));
