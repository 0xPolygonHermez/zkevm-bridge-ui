import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenAdderStyles = createUseStyles((theme: Theme) => ({
  tokenAdder: {
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: [theme.spacing(0.5), 0],
    margin: [theme.spacing(2)],
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    width: theme.spacing(4),
    height: theme.spacing(4),
    background: theme.palette.grey.light,
    border: 0,
    padding: 0,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: theme.hoverTransition,
    "&:hover": {
      background: theme.palette.grey.main,
    },
  },
  backButtonIcon: {
    width: 16,
    height: 16,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    width: theme.spacing(4),
    height: theme.spacing(4),
    background: theme.palette.grey.light,
    border: 0,
    padding: 0,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: theme.hoverTransition,
    "&:hover": {
      background: theme.palette.grey.main,
    },
  },
  closeButtonIcon: {
    width: 16,
    height: 16,
  },
  tokenIcon: {
    marginRight: theme.spacing(1),
  },
  disclaimerBox: {
    display: "flex",
    alignItems: "center",
    margin: [theme.spacing(1), theme.spacing(2)],
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey.light,
    borderRadius: 8,
  },
  disclaimerBoxWarningIcon: {
    marginRight: theme.spacing(1),
  },
  disclaimerBoxMessage: {
    color: theme.palette.grey.dark,
  },
  tokenInfoTable: {
    margin: [theme.spacing(1), theme.spacing(2)],
    padding: theme.spacing(1),
  },
  addTokenButton: {
    margin: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.white,
    fontSize: "20px",
    lineHeight: "24px",
    padding: theme.spacing(2),
    borderRadius: 80,
    border: "none",
    cursor: "pointer",
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

export default useTokenAdderStyles;
