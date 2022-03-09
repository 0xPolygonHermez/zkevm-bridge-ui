import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useActivityStyles = createUseStyles((theme: Theme) => ({
  selectorBoxes: {
    display: "flex",
    marginTop: theme.spacing(1),
  },
  selectorBox: {
    display: "flex",
    padding: [[theme.spacing(0.75), theme.spacing(1)]],
    marginRight: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.white,
  },
  status: {
    padding: [[theme.spacing(0.5), theme.spacing(1)]],
    lineHeight: `${theme.spacing(1.75)}px`,
  },
  number: {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.grey.light,
    padding: [[0, theme.spacing(1)]],
    borderRadius: theme.spacing(0.75),
    lineHeight: `${theme.spacing(1.75)}px`,
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
