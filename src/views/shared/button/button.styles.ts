import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useButtonStyles = createUseStyles((theme: Theme) => ({
  button: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.white,
    fontSize: "20px",
    lineHeight: "24px",
    padding: theme.spacing(2),
    borderRadius: 80,
    border: "none",
    width: "260px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    "&:disabled": {
      backgroundColor: theme.palette.grey.dark,
    },
  },
}));

export default useButtonStyles;
