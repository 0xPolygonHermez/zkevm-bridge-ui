import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTransactionActionsStyles = createUseStyles((theme: Theme) => ({
  buttons: {
    display: "flex",
    justifyContent: "center",
    margin: [[theme.spacing(1), theme.spacing(5), theme.spacing(2)]],
  },
  actionBtn: {
    margin: [[0, theme.spacing(2.5)]],
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "&:hover p:first-child": {
      transform: "scale(0.97)",
      boxShadow: ` 0 ${theme.spacing(1)}px ${theme.spacing(2.5)}px ${theme.palette.primary.hover}`,
      transition: theme.hoverTransition,
    },
  },
  circle: {
    display: "flex",
    backgroundColor: theme.palette.white,
    justifyContent: "center",
    alignItems: "center",
    width: theme.spacing(8),
    height: theme.spacing(8),
    borderRadius: theme.spacing(8),
  },
  actionText: {
    fontWeight: theme.fontWeights.medium,
    marginTop: theme.spacing(1),
  },
}));

export default useTransactionActionsStyles;
