import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useHeaderStyles = createUseStyles((theme: Theme) => ({
  activityLabel: {
    display: "none",
    [theme.breakpoints.upSm]: {
      display: "block",
    },
  },
  block: {
    display: "flex",
    flex: 1,
    gap: theme.spacing(0.75),
  },
  centerBlock: {
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    display: "flex",
    margin: [theme.spacing(2), "auto", 0],
    width: "100%",
  },
  leftBlock: {
    justifyContent: "left",
  },
  link: {
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
    alignItems: "center",
    borderRadius: 8,
    display: "flex",
    gap: theme.spacing(1),
    padding: [theme.spacing(0.75), theme.spacing(1)],
    transition: theme.hoverTransition,
  },
  logo: {
    height: 56,
  },
  rightBlock: {
    justifyContent: "end",
  },
}));
