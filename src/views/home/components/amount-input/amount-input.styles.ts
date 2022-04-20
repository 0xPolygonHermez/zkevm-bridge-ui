import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useAmountInputStyles = createUseStyles((theme: Theme) => ({
  wrapper: {
    display: "flex",
    marginLeft: theme.spacing(2.5),
    alignItems: "center",
    flex: 1,
  },
  amountInput: {
    width: "100%",
    textAlign: "right",
    borderRadius: 8,
    border: "none",
    outline: "none",
    fontSize: "20px",
    lineHeight: "24px",
    [theme.breakpoints.upSm]: {
      fontSize: (value: number) => (value < 16 ? "40px" : "30px"),
      lineHeight: "40px",
    },
  },
  maxButton: {
    background: "none",
    border: "none",
  },
  maxText: {
    color: theme.palette.black,
    cursor: "pointer",
  },
}));

export default useAmountInputStyles;
