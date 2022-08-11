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
  row: {
    display: "flex",
  },
  steps: {
    color: theme.palette.grey.dark,
    fontSize: 14,
    marginBottom: theme.spacing(2),
  },
  actionCircle: {
    width: theme.spacing(5.75),
    height: theme.spacing(5.75),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.grey.light,
    borderRadius: "100%",
  },
  actionColumn: {
    flex: 1,
    margin: [0, theme.spacing(2)],
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  time: {
    color: theme.palette.grey.dark,
    fontSize: 14,
  },
  statusBox: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.main,
    fontSize: 14,
    padding: [theme.spacing(0.5), theme.spacing(1)],
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  greenStatus: {
    color: theme.palette.success.main,
    backgroundColor: theme.palette.success.light,
  },
  tokenColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
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
      backgroundColor: theme.palette.disabled,
      cursor: "initial",
    },
  },
}));

export default useBridgeCardStyles;
