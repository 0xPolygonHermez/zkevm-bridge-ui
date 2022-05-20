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
  tokenWrapper: {
    display: "flex",
    background: theme.palette.grey.light,
    borderRadius: 8,
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
  },
  tokenMainButton: {
    cursor: "pointer",
    border: "none",
    padding: theme.spacing(2),
    display: "flex",
    flex: 1,
    alignItems: "center",
    gap: theme.spacing(1),
    borderRadius: [8, 0, 0, 8],
    "&:hover": {
      background: theme.palette.grey.main,
    },
    "&:disabled": {
      background: "transparent",
      cursor: "initial",
      opacity: 0.5,
    },
  },
  tokenAccessoryButton: {
    cursor: "pointer",
    border: "none",
    minWidth: 100,
    padding: theme.spacing(2),
    borderRadius: [0, 8, 8, 0],
    "&:hover": {
      background: theme.palette.grey.main,
    },
    "&:disabled": {
      background: "transparent",
      cursor: "initial",
      opacity: 0.5,
    },
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
