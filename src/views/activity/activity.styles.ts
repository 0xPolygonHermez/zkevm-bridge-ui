import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

interface StylesProps {
  displayAll: boolean;
}

const useActivityStyles = createUseStyles((theme: Theme) => ({
  stickyContent: {
    top: 0,
    position: "sticky",
    background: theme.palette.grey.light,
  },
  stickyContentBorder: {
    borderBottom: `${theme.palette.grey.main} 1px solid`,
  },
  numberAllBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: ({ displayAll }: StylesProps) =>
      displayAll ? theme.palette.grey.light : theme.palette.grey.main,
    padding: [0, theme.spacing(1)],
    borderRadius: 6,
    lineHeight: `${theme.spacing(1.75)}px`,
  },
  numberPendingBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: ({ displayAll }: StylesProps) =>
      !displayAll ? theme.palette.grey.light : theme.palette.grey.main,
    padding: [0, theme.spacing(1)],
    borderRadius: 6,
    lineHeight: `${theme.spacing(1.75)}px`,
  },
  selectorBoxes: {
    maxWidth: theme.maxWidth,
    display: "flex",
    margin: [theme.spacing(2), "auto"],
  },
  selectorBox: {
    display: "flex",
    padding: [[theme.spacing(0.75), theme.spacing(1)]],
    marginRight: theme.spacing(2),
    borderRadius: 8,
  },
  allBox: ({ displayAll }: StylesProps) =>
    displayAll
      ? {
          backgroundColor: theme.palette.white,
        }
      : {
          backgroundColor: "inherit",
          color: theme.palette.grey.dark,
          cursor: "pointer",
        },
  pendingBox: ({ displayAll }: StylesProps) =>
    !displayAll
      ? {
          backgroundColor: theme.palette.white,
        }
      : {
          backgroundColor: "inherit",
          color: theme.palette.grey.dark,
          cursor: "pointer",
        },
  status: {
    padding: [theme.spacing(0.5), theme.spacing(1)],
    lineHeight: `${theme.spacing(1.75)}px`,
  },
  contentWrapper: {
    padding: [0, theme.spacing(2)],
  },
  emptyMessage: {
    textAlign: "center",
    lineHeight: "26px",
    maxWidth: theme.maxWidth,
    padding: 100,
    margin: "auto",
  },
  bridgeCardwrapper: {
    "&:not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
}));

export default useActivityStyles;
