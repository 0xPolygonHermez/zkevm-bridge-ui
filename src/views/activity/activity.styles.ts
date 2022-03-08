import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useActivityStyles = createUseStyles((theme: Theme) => ({
  title: {
    margin: [[theme.spacing(3), 0]],
    fontWeight: theme.fontWeights.bold,
    fontSize: theme.spacing(3),
  },
  selectorBoxes: {
    display: "flex",
    marginTop: theme.spacing(1),
  },
  selectorBox: {
    padding: [[theme.spacing(0.75), theme.spacing(1)]],
    marginRight: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.white,
  },
  status: {
    display: "inline-flex",
    padding: [[theme.spacing(0.5), theme.spacing(1)]],
  },
  number: {
    backgroundColor: theme.palette.grey.light,
    padding: [[theme.spacing(0.5), theme.spacing(1)]],
    borderRadius: theme.spacing(0.75),
  },
  inactiveBox: {
    backgroundColor: "inherit",
    color: theme.palette.grey.dark,
    cursor: "pointer",
  },
  inactiveNumber: {
    backgroundColor: theme.palette.grey.main,
  },
}));

export default useActivityStyles;
