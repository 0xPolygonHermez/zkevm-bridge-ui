import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";
import { Transaction } from "src/domain";

interface StylesProps {
  status?: Transaction["status"];
}

const useBridgeDetailsStyles = createUseStyles((theme: Theme) => ({
  card: {
    padding: theme.spacing(3),
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: ({ status }: StylesProps) => {
      switch (status) {
        case "completed":
          return theme.palette.success.main;
        case "on-hold":
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
    width: 48,
    height: 48,
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
    borderRadius: 8,
    backgroundColor: theme.palette.grey.light,
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
  finaliseRow: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(1),
    margin: [theme.spacing(3), 0],
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(6), 0],
    },
  },
  finaliseSpinner: {
    "& path": {
      fill: theme.palette.white,
    },
  },
}));

export default useBridgeDetailsStyles;
