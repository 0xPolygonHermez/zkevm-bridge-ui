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
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: [theme.spacing(0.5), 0],
    margin: [theme.spacing(2), theme.spacing(2), theme.spacing(1)],
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
  searchInputContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: [0, theme.spacing(2)],
    borderBottom: `1px solid ${theme.palette.grey.light}`,
  },
  searchInput: {
    width: "100%",
    border: 0,
    outline: 0,
    lineHeight: "36px",
  },
  searchIcon: {
    marginRight: theme.spacing(1),
  },
  clearSearchButton: {
    background: theme.palette.disabled,
    border: 0,
    padding: theme.spacing(0.5),
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    overflowY: "auto",
    maxHeight: 270,
    margin: [theme.spacing(2)],
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
