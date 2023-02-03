import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useBridgeDetailsStyles = createUseStyles((theme: Theme) => ({
  alignRow: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1),
  },
  balance: {
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.grey.light}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    justifyContent: "center",
    marginBottom: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  },
  card: {
    margin: [theme.spacing(5), "auto", 0],
    maxWidth: theme.maxWidth,
    padding: theme.spacing(3),
    width: "100%",
  },
  contentWrapper: {
    padding: [0, theme.spacing(2)],
  },
  dotCompleted: {
    backgroundColor: theme.palette.success.main,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  dotOnHold: {
    backgroundColor: theme.palette.error.main,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  dotProcessing: {
    backgroundColor: theme.palette.warning.main,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  explorerButton: {
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
    alignItems: "center",
    backgroundColor: theme.palette.grey.light,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    padding: [theme.spacing(1), theme.spacing(2)],
  },
  fiat: {
    color: theme.palette.grey.dark,
    fontSize: 14,
  },
  finaliseRow: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    justifyContent: "center",
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
  lastRow: {
    paddingBottom: 0,
  },
  row: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    justifyContent: "space-between",
    padding: [theme.spacing(2), 0],
    [theme.breakpoints.upSm]: {
      alignItems: "center",
      flexDirection: "row",
      padding: [theme.spacing(2.5), 0],
    },
  },
  tokenIcon: {
    height: 48,
    margin: [theme.spacing(1), 0, theme.spacing(2)],
    width: 48,
  },
}));
