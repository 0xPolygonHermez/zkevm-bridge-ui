import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useListStyles = createUseStyles((theme: Theme) => ({
  background: {
    background: theme.palette.transparency,
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: theme.spacing(20),
  },
  card: {
    width: "100%",
    maxWidth: 426,
    padding: theme.spacing(2),
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: [theme.spacing(0.5), 0],
    marginBottom: theme.spacing(2),
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    width: theme.spacing(4),
    height: theme.spacing(4),
    background: theme.palette.grey.light,
    border: 0,
    padding: 0,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: theme.hoverTransition,
    "&:hover": {
      background: theme.palette.grey.main,
    },
  },
  closeButtonIcon: {
    width: 16,
    height: 16,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    maxHeight: 270,
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.grey.main,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme.palette.grey.dark,
    },
  },
  button: {
    border: "none",
    display: "flex",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    background: theme.palette.grey.light,
    borderRadius: 8,
    cursor: "pointer",
    alignItems: "center",
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
    "&:hover": {
      background: theme.palette.grey.main,
    },
  },
  icon: {
    width: "24px",
    height: "24px",
  },
}));

export default useListStyles;
