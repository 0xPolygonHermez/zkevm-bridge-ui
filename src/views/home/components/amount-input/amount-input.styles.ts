import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useAmountInputStyles = createUseStyles((theme: Theme) => ({
  amountInput: {
    width: "50%",
    textAlign: "right",
    border: "none",
    outline: "none",
    fontSize: "20px",
    lineHeight: "24px",
    [theme.breakpoints.upSm]: {
      fontSize: "40px",
      lineHeight: "40px",
    },
  },
}));

export default useAmountInputStyles;
