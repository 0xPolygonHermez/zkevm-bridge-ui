import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useNetworkSelectorStyles = createUseStyles((theme: Theme) => ({
  networkButton: {
    maxWidth: 200,
    padding: theme.spacing(1.25),
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "none",
    background: theme.palette.white,
    cursor: "pointer",
    gap: theme.spacing(1),
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
  networkButtonText: {
    fontSize: "14px !important",
    display: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    [theme.breakpoints.upSm]: {
      display: "block",
    },
  },
}));

export default useNetworkSelectorStyles;
