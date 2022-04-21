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
    marginTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.grey.light}`,
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(0.5),
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
    marginTop: theme.spacing(1),
    borderRadius: 8,
    cursor: "pointer",
    alignItems: "center",
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
