import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTransactionCardStyles = createUseStyles((theme: Theme) => ({
  card: {
    padding: [[theme.spacing(2), theme.spacing(3)]],
    marginTop: theme.spacing(2),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
  row: {
    display: "flex",
  },
  steps: {
    color: theme.palette.grey.dark,
    fontSize: theme.spacing(1.75),
    marginBottom: theme.spacing(2),
  },
  actionCircle: {
    width: theme.spacing(5.75),
    height: theme.spacing(5.75),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.grey.light,
    borderRadius: theme.spacing(5),
  },
  actionColumn: {
    flex: 1,
    margin: [[0, theme.spacing(2)]],
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  time: {
    color: theme.palette.grey.dark,
    fontSize: theme.spacing(1.75),
  },
  statusBox: {
    backgroundColor: theme.palette.orange.opacity,
    color: theme.palette.orange.main,
    fontWeight: theme.fontWeights.medium,
    fontSize: theme.spacing(1.75),
    padding: [[theme.spacing(0.5), theme.spacing(1)]],
    borderRadius: theme.spacing(1),
    alignSelf: "flex-start",
  },
  redStatus: {
    color: theme.palette.red.main,
    backgroundColor: theme.palette.red.opacity,
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
    fontWeight: theme.fontWeights.medium,
  },
  fiat: {
    color: theme.palette.grey.dark,
    fontSize: theme.spacing(1.75),
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
    borderRadius: theme.spacing(4),
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

export default useTransactionCardStyles;
