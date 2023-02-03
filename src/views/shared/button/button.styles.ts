import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useButtonStyles = createUseStyles((theme: Theme) => ({
  button: {
    "&:disabled": {
      backgroundColor: theme.palette.grey.dark,
      cursor: "default",
      opacity: 0.4,
    },
    "&:hover&:not(:disabled)": {
      backgroundColor: theme.palette.primary.dark,
    },
    alignItems: "center",
    backgroundColor: theme.palette.primary.main,
    border: "none",
    borderRadius: 80,
    color: theme.palette.white,
    cursor: "pointer",
    display: "flex",
    fontSize: "20px",
    justifyContent: "center",
    lineHeight: "24px",
    minWidth: "260px",
    padding: [theme.spacing(2), theme.spacing(10)],
    transition: theme.hoverTransition,
  },
  paddedSpinner: {
    paddingLeft: theme.spacing(1.5),
  },
}));
