import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenInfoStyles = createUseStyles((theme: Theme) => ({
  tokenInfo: {
    display: "flex",
    flexDirection: "column",
  },
  tokenInfoTable: {
    margin: [theme.spacing(1), theme.spacing(2)],
    padding: theme.spacing(1),
  },
  removeTokenButton: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(2),
    margin: theme.spacing(2),
    backgroundColor: theme.palette.grey.light,
    color: theme.palette.black,
    fontSize: "20px",
    lineHeight: "24px",
    padding: theme.spacing(1),
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
