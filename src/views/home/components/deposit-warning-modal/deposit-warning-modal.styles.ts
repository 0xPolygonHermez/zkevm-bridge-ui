import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useDepositWarningModalStyles = createUseStyles((theme: Theme) => ({
  background: {
    alignItems: "center",
    background: theme.palette.transparency,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    width: "100%",
    [theme.breakpoints.upSm]: {
      alignItems: "flex-start",
    },
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
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    maxWidth: 510,
    padding: theme.spacing(3),
    width: "100%",
    [theme.breakpoints.upSm]: {
      marginTop: theme.spacing(30),
      padding: theme.spacing(4),
    },
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
  warningText: {
    lineHeight: "24px",
    margin: [theme.spacing(2), 0],
    textAlign: "center",
  },
}));
