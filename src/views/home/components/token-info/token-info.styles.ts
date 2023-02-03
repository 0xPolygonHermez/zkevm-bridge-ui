import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenInfoStyles = createUseStyles((theme: Theme) => ({
  removeTokenButton: {
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
    backgroundColor: theme.palette.grey.light,
    border: "none",
    borderRadius: 9,
    color: theme.palette.black,
    cursor: "pointer",
    display: "flex",
    fontSize: "20px",
    gap: theme.spacing(2),
    justifyContent: "center",
    lineHeight: "24px",
    padding: theme.spacing(1.5),
    transition: theme.hoverTransition,
  },
  tokenInfo: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  tokenInfoTable: {
    flex: 1,
    marginTop: theme.spacing(2),
  },
}));
