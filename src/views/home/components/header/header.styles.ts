import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useHeaderStyles = createUseStyles((theme: Theme) => ({
  activityLabel: {
    display: "none",
    marginLeft: theme.spacing(1),
    [theme.breakpoints.upSm]: {
      display: "block",
    },
  },
  block: {
    display: "flex",
    flex: 1,
    gap: theme.spacing(0.75),
  },
  header: {
    alignItems: "center",
    display: "flex",
    margin: [theme.spacing(3), "auto", 0],
    width: "100%",
  },
  leftBlock: {
    justifyContent: "left",
  },
  link: {
  },
  logo: {
    height: 48,
  },
  rightBlock: {
    justifyContent: "end",
  },
  roundedBlock: {
    alignItems: 'center',
    background: '#ffffff',
    borderRadius: '12px',
    display: 'flex',
    height: 48,
    justifyContent: 'space-between',
    padding: theme.spacing(1.5),
  },
}));
