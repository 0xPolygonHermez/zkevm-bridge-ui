import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTextMatchFormStyles = createUseStyles((theme: Theme) => ({
  checkbox: {
    height: 18,
    width: 18,
  },
  checkboxLabel: {
    userSelect: "none",
  },
  checkboxWrapper: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(4),
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  input: {
    "&:focus": {
      borderColor: theme.palette.black,
      outline: "none",
    },
    "&:hover": {
      borderColor: theme.palette.black,
    },
    appearance: "none",
    borderColor: theme.palette.grey.dark,
    borderRadius: 8,
    borderStyle: "solid",
    fontSize: 18,
    fontWeight: 500,
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(1),
    padding: [theme.spacing(1.5), theme.spacing(1.75)],
    transition: theme.hoverTransition,
  },
}));
