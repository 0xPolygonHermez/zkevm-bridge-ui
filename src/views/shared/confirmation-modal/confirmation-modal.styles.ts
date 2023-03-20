import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useConfirmationModalStyles = createUseStyles((theme: Theme) => ({
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
  },
  card: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(30),
    maxWidth: 510,
    padding: theme.spacing(4),
    width: "100%",
  },
  textContainer: {
    "& p": {
      lineHeight: "24px",
      textAlign: "center",
    },
    margin: [theme.spacing(3), 0, [theme.spacing(4)]],
  },
  title: {
    textAlign: "center",
  },
}));
