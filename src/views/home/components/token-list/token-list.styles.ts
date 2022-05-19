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
  tokenWrapper: {
    display: "flex",
    padding: theme.spacing(2),
    background: theme.palette.grey.light,
    borderRadius: 8,
    alignItems: "center",
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
  },
  enabledTokenWrapper: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
  },
  disabledTokenWrapper: {
    background: theme.palette.grey.light,
    opacity: 0.5,
  },
  tokenMainButton: {
    cursor: "pointer",
    border: "none",
    background: "transparent",
    display: "flex",
    flex: 1,
    alignItems: "center",
    gap: theme.spacing(1),
    "&:disabled": {
      cursor: "initial",
    },
  },
  tokenAccessoryButton: {
    cursor: "pointer",
    border: "none",
    background: "transparent",
    "&:disabled": {
      cursor: "initial",
    },
  },
  loading: {
    lineHeight: "48px",
  },
  error: {
    padding: theme.spacing(1),
  },
}));

export default useListStyles;
