import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";
import { TransactionStatus } from "src/domain";
interface StylesProps {
  status: TransactionStatus;
}

const useTransactionDetailsStyles = createUseStyles((theme: Theme) => ({
  card: {
    padding: theme.spacing(3),
  },
  dot: {
    width: theme.spacing(0.75),
    height: theme.spacing(0.75),
    backgroundColor: ({ status }: StylesProps) => {
      switch (status) {
        case "completed":
          return theme.palette.success;
        case "on-hold":
        case "failed":
          return theme.palette.error.main;
        default:
          return theme.palette.warning.main;
      }
    },
    borderRadius: "50%",
  },
  balance: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.grey.light}`,
    paddingBottom: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  },
  tokenIcon: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    margin: [theme.spacing(1), 0, theme.spacing(2)],
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexDirection: "column",
    padding: [theme.spacing(2), 0],
    gap: theme.spacing(1),
    [theme.breakpoints.upSm]: {
      alignItems: "center",
      flexDirection: "row",
      padding: [theme.spacing(2.5), 0],
    },
  },
  alignRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  lastRow: {
    paddingBottom: 0,
  },
  explorerButton: {
    display: "flex",
    cursor: "pointer",
    padding: [theme.spacing(1), theme.spacing(2)],
    gap: theme.spacing(1),
    alignItems: "center",
    border: "none",
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.grey.light,
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
  finaliseRow: {
    display: "flex",
    justifyContent: "center",
    margin: [theme.spacing(3), 0],
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(6), 0],
    },
  },
  finaliseButton: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    padding: [theme.spacing(2), theme.spacing(2)],
    width: theme.spacing(31),
    border: "none",
    backgroundColor: theme.palette.primary.main,
    cursor: "pointer",
    borderRadius: theme.spacing(5),
    gap: theme.spacing(1),
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    "&:disabled": {
      backgroundColor: theme.palette.disabled,
      cursor: "initial",
    },
  },
  finaliseButtonText: {
    color: theme.palette.white,
  },
  finaliseSpinner: {
    "& path": {
      fill: theme.palette.white,
    },
  },
}));

export default useTransactionDetailsStyles;
