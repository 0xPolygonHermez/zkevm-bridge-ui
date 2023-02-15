import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useBridgeCardStyles = createUseStyles((theme: Theme) => ({
  amount: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
  bottom: {
    alignItems: "center",
    borderTop: [1, "solid", theme.palette.grey.light],
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  card: {
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
    cursor: "pointer",
    margin: "auto",
    maxWidth: theme.maxWidth,
    padding: [theme.spacing(2), theme.spacing(3)],
    transition: theme.hoverTransition,
  },
  circle: {
    alignItems: "center",
    backgroundColor: theme.palette.grey.light,
    borderRadius: "100%",
    display: "flex",
    height: theme.spacing(6),
    justifyContent: "center",
    width: theme.spacing(6),
  },
  fiat: {
    color: theme.palette.grey.dark,
    fontSize: 14,
  },
  finaliseButton: {
    "&:disabled": {
      backgroundColor: theme.palette.grey.dark,
      cursor: "initial",
      opacity: 0.4,
    },
    "&:hover&:not(:disabled)": {
      backgroundColor: theme.palette.primary.dark,
    },
    backgroundColor: theme.palette.primary.main,
    border: "none",
    borderRadius: 32,
    color: theme.palette.white,
    cursor: "pointer",
    fontWeight: 700,
    lineHeight: "20px",
    padding: [theme.spacing(0.75), theme.spacing(3)],
  },
  greenStatus: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.main,
  },
  info: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    marginLeft: theme.spacing(2),
  },
  infoContainer: {
    alignItems: "center",
    display: "flex",
    flex: 1,
  },
  label: {
    marginRight: "auto",
  },
  pendingStatus: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.main,
  },
  row: {
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  statusBox: {
    borderRadius: 8,
    fontSize: 14,
    marginRight: "auto",
    padding: [theme.spacing(0.5), theme.spacing(1)],
  },
  steps: {
    color: theme.palette.grey.dark,
    fontSize: 14,
    marginBottom: theme.spacing(2),
    marginTop: 0,
  },
  token: {
    alignItems: "center",
    display: "flex",
  },
  tokenIcon: {
    marginRight: theme.spacing(1),
  },
  top: {
    display: "flex",
    flexDirection: "column",
  },
}));
