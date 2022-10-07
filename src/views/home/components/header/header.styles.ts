import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useHeaderStyles = createUseStyles((theme: Theme) => ({
  header: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    margin: [theme.spacing(2), "auto", 0],
  },
  block: {
    flex: 1,
    display: "flex",
    gap: theme.spacing(0.75),
  },
  leftBlock: {
    justifyContent: "left",
  },
  centerBlock: {
    justifyContent: "center",
  },
  rightBlock: {
    justifyContent: "end",
  },
  logo: {
    height: 56,
  },
  link: {
    display: "flex",
    alignItems: "center",
    padding: [theme.spacing(0.75), theme.spacing(1)],
    borderRadius: 8,
    gap: theme.spacing(1),
    transition: theme.hoverTransition,
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
  activityLabel: {
    display: "none",
    [theme.breakpoints.upSm]: {
      display: "block",
    },
  },
}));

export default useHeaderStyles;
