import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenSelectorHeaderStyles = createUseStyles((theme: Theme) => ({
  tokenSelectorHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: [theme.spacing(0.5), 0],
    marginBottom: theme.spacing(1),
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
}));

export default useTokenSelectorHeaderStyles;
