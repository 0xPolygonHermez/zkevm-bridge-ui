import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenInfoTableStyles = createUseStyles((theme: Theme) => ({
  wrapper: {
    background: theme.palette.white,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexDirection: "column",
    padding: [theme.spacing(1), 0],
    gap: theme.spacing(1),
    [theme.breakpoints.upSm]: {
      height: 48,
      alignItems: "center",
      flexDirection: "row",
      padding: 0,
    },
  },
  alignRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  rowRightBlock: {
    display: "flex",
    alignItems: "center",
  },
  chainIcon: {
    height: 20,
    width: 20,
  },
  tokenAddress: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  button: {
    display: "flex",
    border: "none",
    padding: theme.spacing(1),
    background: "transparent",
    cursor: "pointer",
    borderRadius: "50%",
    "&:hover": {
      background: theme.palette.grey.main,
    },
  },
  copyIcon: {
    width: 16,
    height: 16,
    "& path": {
      fill: theme.palette.grey.dark,
    },
  },
  newWindowIcon: {
    width: 16,
    height: 16,
    "& path": {
      fill: theme.palette.grey.dark,
      stroke: theme.palette.grey.dark,
      strokeWidth: 1,
    },
  },
}));

export default useTokenInfoTableStyles;
