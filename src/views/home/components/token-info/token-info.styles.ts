import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenInfoStyles = createUseStyles((theme: Theme) => ({
  tokenInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  tokenInfoTable: {
    marginTop: theme.spacing(2),
    flex: 1,
  },
  removeTokenButton: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(1.5),
    gap: theme.spacing(2),
    backgroundColor: theme.palette.grey.light,
    color: theme.palette.black,
    fontSize: "20px",
    lineHeight: "24px",
    borderRadius: 9,
    border: "none",
    cursor: "pointer",
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
}));

export default useTokenInfoStyles;
