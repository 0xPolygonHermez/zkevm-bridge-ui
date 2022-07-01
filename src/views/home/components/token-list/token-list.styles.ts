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
    maxWidth: 500,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
  searchInput: {
    flex: 1,
    border: "none",
    lineHeight: "36px",
    outline: "none",
    borderBottom: "1px solid #F0F1F6",
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  list: {
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
  tokenButton: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: theme.palette.grey.light,
    borderRadius: 8,
    overflow: "hidden",
    border: "none",
    cursor: "pointer",
    padding: theme.spacing(2),
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
    "&:hover": {
      background: theme.palette.grey.main,
    },
  },
  tokenInfo: {
    display: "flex",
    alignItems: "center",
  },
  tokenIcon: {
    marginRight: theme.spacing(1),
  },
  tokenBalance: {
    color: theme.palette.black,
  },
  loading: {
    lineHeight: "48px",
  },
  error: {
    padding: theme.spacing(1),
    lineHeight: "26px",
  },
}));

export default useListStyles;
