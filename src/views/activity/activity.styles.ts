import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

interface StylesProps {
  displayAll: boolean;
}

const useActivityStyles = createUseStyles((theme: Theme) => ({
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
  bridgeCardwrapper: {
    "&:not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
  contentWrapper: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    padding: [0, theme.spacing(2)],
  },
  emptyMessage: {
    alignSelf: "center",
    maxWidth: theme.maxWidth,
    padding: [50, theme.spacing(2)],
    textAlign: "center",
    width: "100%",
    [theme.breakpoints.upSm]: {
      padding: 100,
    },
  },
  numberAllBox: {
    alignItems: "center",
    backgroundColor: ({ displayAll }: StylesProps) =>
      displayAll ? theme.palette.grey.light : theme.palette.grey.main,
    borderRadius: 6,
    display: "flex",
    lineHeight: `${theme.spacing(1.75)}px`,
    padding: [0, theme.spacing(1)],
  },
  numberPendingBox: {
    alignItems: "center",
    backgroundColor: ({ displayAll }: StylesProps) =>
      !displayAll ? theme.palette.grey.light : theme.palette.grey.main,
    borderRadius: 6,
    display: "flex",
    lineHeight: `${theme.spacing(1.75)}px`,
    padding: [0, theme.spacing(1)],
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
  selectorBox: {
    borderRadius: 8,
    display: "flex",
    marginRight: theme.spacing(2),
    padding: [[theme.spacing(0.75), theme.spacing(1)]],
  },
  selectorBoxes: {
    display: "flex",
    margin: [theme.spacing(5), "auto", theme.spacing(2)],
    maxWidth: theme.maxWidth,
    width: "100%",
  },
  status: {
    lineHeight: `${theme.spacing(1.75)}px`,
    padding: [theme.spacing(0.5), theme.spacing(1)],
  },
  stickyContent: {
    background: theme.palette.grey.light,
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  stickyContentBorder: {
    borderBottom: `${theme.palette.grey.main} 1px solid`,
  },
}));

export default useActivityStyles;
