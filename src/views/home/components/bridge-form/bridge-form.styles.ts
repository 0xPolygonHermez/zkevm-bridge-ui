import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useBridgeFormStyles = createUseStyles((theme: Theme) => ({
  spinner: {
    margin: "auto",
    marginTop: theme.spacing(7),
  },
  form: {
    maxWidth: theme.maxWidth,
    margin: "auto",
  },
  card: {
    padding: [theme.spacing(2), theme.spacing(3)],
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(0.5),
  },
  leftBox: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  rightBox: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  fromChain: {
    padding: [theme.spacing(0.75), theme.spacing(1.25)],
    marginLeft: -theme.spacing(1.25),
    marginTop: theme.spacing(0.5),
    marginBottom: -theme.spacing(0.75),
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    border: "none",
    background: "none",
    cursor: "pointer",
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.grey.light,
    },
    [theme.breakpoints.upSm]: {
      gap: theme.spacing(1.25),
    },
  },
  toChain: {
    padding: [theme.spacing(0.75), theme.spacing(1.25)],
    marginLeft: -theme.spacing(1.25),
    marginTop: theme.spacing(0.5),
    marginBottom: -theme.spacing(0.75),
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    border: "none",
    background: "none",
    [theme.breakpoints.upSm]: {
      gap: theme.spacing(1.25),
    },
  },
  middleRow: {
    padding: [theme.spacing(2), 0, 0],
    marginTop: theme.spacing(1.25),
    borderTop: `1px solid ${theme.palette.grey.light}`,
  },
  tokenSelector: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: [theme.spacing(1), theme.spacing(1.25)],
    backgroundColor: theme.palette.grey.light,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
    [theme.breakpoints.upSm]: {
      backgroundColor: theme.palette.grey.light,
      padding: [theme.spacing(1.5), theme.spacing(2)],
      gap: theme.spacing(2),
    },
  },
  icons: {
    width: 20,
    height: 20,
    [theme.breakpoints.upSm]: {
      width: 24,
      height: 24,
    },
  },
  arrowRow: {
    display: "flex",
    justifyContent: "center",
    margin: [theme.spacing(1), 0],
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(2), 0],
    },
  },
  arrowDownIcon: {
    backgroundColor: theme.palette.grey.main,
    borderRadius: "50%",
    display: "flex",
    [theme.breakpoints.upSm]: {
      width: 40,
      height: 40,
      padding: theme.spacing(0.5),
    },
  },
  button: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
    margin: [theme.spacing(5), "auto"],
  },
}));

export default useBridgeFormStyles;
