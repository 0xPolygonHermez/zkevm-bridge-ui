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
  search: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.25),
    padding: [theme.spacing(1), 0],
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
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
    borderRadius: 8,
    cursor: "pointer",
    alignItems: "center",
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
    "&:hover": {
      background: theme.palette.grey.main,
    },
    "&:disabled": {
      background: theme.palette.grey.main,
      cursor: "initial",
    },
  },
  icon: {
    width: "24px",
    height: "24px",
  },
}));

export default useListStyles;
