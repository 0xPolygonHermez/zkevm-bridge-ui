import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useBridgeConfirmationStyles = createUseStyles((theme: Theme) => ({
  card: {
    width: "100%",
    maxWidth: theme.maxWidth,
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: [theme.spacing(3), "auto", 0],
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(6), "auto", 0],
      padding: theme.spacing(3),
    },
  },
  tokenIcon: {
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.upSm]: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(3),
    },
  },
  fiat: {
    marginTop: theme.spacing(1),
  },
  chainsRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "column",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.grey.light}`,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.upSm]: {
      flexDirection: "row",
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(4),
    },
  },
  chainBox: {
    flex: 1,
    maxWidth: 240,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    backgroundColor: theme.palette.grey.light,
    justifyContent: "center",
    padding: [theme.spacing(1), theme.spacing(2)],
    borderRadius: 56,
  },
  arrowIcon: {
    transform: "rotate(90deg)",
    [theme.breakpoints.upSm]: {
      transform: "none",
      margin: [0, theme.spacing(1)],
    },
  },
  feeBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  fee: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(2),
    [theme.breakpoints.upSm]: {
      marginTop: theme.spacing(6),
    },
  },
  contentWrapper: {
    padding: [0, theme.spacing(2)],
  },
  infoMessage: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  error: {
    marginTop: theme.spacing(2),
  },
}));

export default useBridgeConfirmationStyles;
