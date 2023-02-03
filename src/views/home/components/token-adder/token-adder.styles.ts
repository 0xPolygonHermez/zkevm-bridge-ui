import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenAdderStyles = createUseStyles((theme: Theme) => ({
  addTokenButton: {
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    backgroundColor: theme.palette.primary.main,
    border: "none",
    borderRadius: 80,
    color: theme.palette.white,
    cursor: "pointer",
    fontSize: "20px",
    lineHeight: "24px",
    padding: theme.spacing(2),
    transition: theme.hoverTransition,
  },
  disclaimerBox: {
    alignItems: "center",
    backgroundColor: theme.palette.grey.light,
    borderRadius: 8,
    display: "flex",
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
  },
  disclaimerBoxMessage: {
    color: theme.palette.grey.dark,
  },
  disclaimerBoxWarningIcon: {
    marginRight: theme.spacing(1),
  },
  tokenAdder: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  tokenInfoTable: {
    flex: 1,
    marginTop: theme.spacing(3),
  },
}));
