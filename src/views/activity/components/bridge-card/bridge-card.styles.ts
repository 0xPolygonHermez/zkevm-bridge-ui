import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useBridgeCardStyles = createUseStyles((theme: Theme) => ({
  card: {
    maxWidth: theme.maxWidth,
    padding: [theme.spacing(2), theme.spacing(3)],
    margin: "auto",
    cursor: "pointer",
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
  steps: {
    color: theme.palette.grey.dark,
    fontSize: 14,
    marginTop: 0,
    marginBottom: theme.spacing(2),
  },
  circle: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.grey.light,
    borderRadius: "100%",
  },
  top: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
  },
  infoContainer: {
    display: "flex",
    flex: 1,
  },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    marginLeft: theme.spacing(2),
  },
  label: {
    marginRight: "auto",
  },
  statusBox: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.main,
    fontSize: 14,
    padding: [theme.spacing(0.5), theme.spacing(1)],
    borderRadius: 8,
    marginRight: "auto",
  },
  pendingStatus: {
    color: theme.palette.warning.main,
    backgroundColor: theme.palette.warning.light,
  },
  greenStatus: {
    color: theme.palette.success.main,
    backgroundColor: theme.palette.success.light,
  },
  tokenIcon: {
    marginRight: theme.spacing(1),
  },
  token: {
    display: "flex",
    alignItems: "center",
  },
  fiat: {
    color: theme.palette.grey.dark,
    fontSize: 14,
  },
  amount: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: [1, "solid", theme.palette.grey.light],
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  finaliseButton: {
    border: "none",
    padding: [theme.spacing(0.75), theme.spacing(3)],
    borderRadius: 32,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.white,
    fontWeight: 700,
    lineHeight: "20px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    "&:disabled": {
      backgroundColor: theme.palette.grey.dark,
      opacity: 0.4,
      cursor: "initial",
    },
  },
}));

export default useBridgeCardStyles;
