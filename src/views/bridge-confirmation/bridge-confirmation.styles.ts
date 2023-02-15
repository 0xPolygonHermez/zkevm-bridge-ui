import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useBridgeConfirmationStyles = createUseStyles((theme: Theme) => ({
  arrowIcon: {
    transform: "rotate(90deg)",
    [theme.breakpoints.upSm]: {
      margin: [0, theme.spacing(1)],
      transform: "none",
    },
  },
  button: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    justifyContent: "center",
    marginTop: theme.spacing(3),
    [theme.breakpoints.upSm]: {
      marginTop: theme.spacing(6),
    },
  },
  card: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    margin: [theme.spacing(3), "auto", 0],
    maxWidth: theme.maxWidth,
    padding: theme.spacing(2),
    width: "100%",
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(6), "auto", 0],
      padding: theme.spacing(3),
    },
  },
  chainBox: {
    alignItems: "center",
    backgroundColor: theme.palette.grey.light,
    borderRadius: 56,
    display: "flex",
    flex: 1,
    gap: theme.spacing(1),
    justifyContent: "center",
    maxWidth: 240,
    padding: [theme.spacing(1), theme.spacing(2)],
  },
  chainName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chainsRow: {
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.grey.light}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    width: "100%",
    [theme.breakpoints.upSm]: {
      flexDirection: "row",
      paddingBottom: theme.spacing(4),
      paddingTop: theme.spacing(3),
    },
  },
  contentWrapper: {
    padding: [0, theme.spacing(2)],
  },
  error: {
    marginTop: theme.spacing(2),
  },
  fee: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1),
  },
  feeBlock: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  fiat: {
    marginTop: theme.spacing(1),
  },
  infoMessage: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1),
  },
  tokenIcon: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(0),
    [theme.breakpoints.upSm]: {
      marginBottom: theme.spacing(3),
      marginTop: theme.spacing(1),
    },
  },
}));
