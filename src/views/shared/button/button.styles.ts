import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

interface StyleProps {
  addSpinnerSpacing: boolean;
}

const useButtonStyles = createUseStyles((theme: Theme) => ({
  spinner: {
    paddingLeft: ({ addSpinnerSpacing }: StyleProps) =>
      addSpinnerSpacing ? theme.spacing(1.5) : 0,
  },
  button: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.white,
    fontSize: "20px",
    lineHeight: "24px",
    padding: [theme.spacing(2), theme.spacing(10)],
    borderRadius: 80,
    border: "none",
    minWidth: "260px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    "&:disabled": {
      backgroundColor: theme.palette.grey.dark,
      cursor: "default",
    },
  },
}));

export default useButtonStyles;
