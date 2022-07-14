import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useAmountInputStyles = createUseStyles((theme: Theme) => ({
  wrapper: {
    display: "flex",
    marginLeft: theme.spacing(1),
    alignItems: "center",
    flex: 1,
    [theme.breakpoints.upSm]: {
      marginLeft: theme.spacing(2.5),
    },
  },
  amountInput: {
    width: "100%",
    textAlign: "right",
    borderRadius: 8,
    border: "none",
    outline: "none",
    fontSize: "20px",
    lineHeight: "24px",
    "&:disabled": {
      backgroundColor: "transparent",
    },
    [theme.breakpoints.upSm]: {
      fontSize: (value: number) => (value < 16 ? "40px" : "30px"),
      lineHeight: "40px",
    },
  },
  maxButton: {
    padding: theme.spacing(1),
    background: "none",
    border: "none",
    color: theme.palette.black,
    "&:not(:disabled)": {
      cursor: "pointer",
    },
  },
  maxText: {
    color: theme.palette.black,
  },
}));

export default useAmountInputStyles;
