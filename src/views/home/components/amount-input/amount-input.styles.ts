import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useAmountInputStyles = createUseStyles((theme: Theme) => ({
  amountInput: {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 8,
    fontSize: "20px",
    lineHeight: "24px",
    outline: "none",
    textAlign: "left",
    width: "100%",
    [theme.breakpoints.upSm]: {
      fontSize: (value: number) => (value < 16 ? "40px" : "30px"),
      lineHeight: "40px",
    },
  },
  maxButton: {
    "&:not(:disabled)": {
      cursor: "pointer",
    },
    background: "none",
    border: "none",
    color: theme.palette.black,
    padding: theme.spacing(1),
  },
  maxText: {
    color: theme.palette.black,
  },
  tokenSelector: {
    alignItems: "center",
    backgroundColor: 'transparent',
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    padding: 0,
    transition: theme.hoverTransition,
    [theme.breakpoints.upSm]: {
      gap: theme.spacing(1.5),
    },
  },
  wrapper: {
    alignItems: "center",
    background: '#f6f6f6',
    borderRadius: '12px',
    display: "flex",
    flex: 1,
    height: '54px',
    padding: [0, theme.spacing(1.5)],
  },
}));
