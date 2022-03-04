import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTransactionActionsStyles = createUseStyles((theme: Theme) => ({
  buttons: {
    display: "flex",
    justifyContent: "center",
    margin: [[theme.spacing(1), theme.spacing(5)]],
  },
  buttonBox: {
    textAlign: "center",
  },
  actionButton: {
    margin: [[0, theme.spacing(2.5)]],
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: theme.palette.white,
    justifyContent: "center",
    width: theme.spacing(8),
    height: theme.spacing(8),
    borderRadius: theme.spacing(8),
    "&:hover": {
      transform: "scale(0.97)",
      boxShadow: ` 0 ${theme.spacing(1)}px ${theme.spacing(2.5)}px ${theme.palette.primary.hover}`,
      transition: theme.hoverTransition,
    },
  },
  actionText: {
    fontWeight: theme.fontWeights.medium,
    marginTop: theme.spacing(1),
  },
}));

export default useTransactionActionsStyles;
