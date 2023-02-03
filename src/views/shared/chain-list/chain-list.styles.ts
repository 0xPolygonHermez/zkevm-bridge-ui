import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useListStyles = createUseStyles((theme: Theme) => ({
  background: {
    alignItems: "center",
    background: theme.palette.transparency,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    padding: [0, theme.spacing(1)],
    width: "100%",
  },
  button: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
    alignItems: "center",
    background: theme.palette.grey.light,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    transition: theme.hoverTransition,
  },
  card: {
    maxWidth: 426,
    padding: theme.spacing(2),
    width: "100%",
  },
  closeButton: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
    alignItems: "center",
    background: theme.palette.grey.light,
    border: 0,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    height: theme.spacing(4),
    justifyContent: "center",
    padding: 0,
    position: "absolute",
    right: 0,
    transition: theme.hoverTransition,
    width: theme.spacing(4),
  },
  closeButtonIcon: {
    height: 16,
    width: 16,
  },
  header: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
    padding: [theme.spacing(0.5), 0],
    position: "relative",
  },
  icon: {
    height: "24px",
    width: "24px",
  },
  list: {
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.grey.main,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme.palette.grey.dark,
    },
    display: "flex",
    flexDirection: "column",
    maxHeight: 270,
    overflowY: "auto",
  },
}));
