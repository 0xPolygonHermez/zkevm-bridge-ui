import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenInfoStyles = createUseStyles((theme: Theme) => ({
  tokenInfo: {
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
  tokenDetails: {
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
