import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenAdderStyles = createUseStyles((theme: Theme) => ({
  tokenAdder: {
    display: "flex",
    flexDirection: "column",
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
