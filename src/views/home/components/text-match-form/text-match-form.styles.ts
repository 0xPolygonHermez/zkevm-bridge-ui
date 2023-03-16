import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTextMatchFormStyles = createUseStyles((theme: Theme) => ({
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
    fontSize: 20,
    fontWeight: 500,
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(1),
    padding: [theme.spacing(1.75), theme.spacing(2)],
    transition: theme.hoverTransition,
  },
}));
