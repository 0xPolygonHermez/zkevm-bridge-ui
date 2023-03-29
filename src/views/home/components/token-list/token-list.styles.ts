import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenListStyles = createUseStyles((theme: Theme) => ({
  addTokenButton: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
    background: theme.palette.white,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    minWidth: 120,
    padding: 8,
    position: "absolute",
    right: 10,
    top: 10,
  },
  centeredElement: {
    alignItems: "center",
    display: "flex",
    height: "100%",
    justifyContent: "center",
    textAlign: "center",
  },
  clearSearchButton: {
    "&:hover": {
      background: theme.palette.black,
    },
    alignItems: "center",
    background: theme.palette.grey.dark,
    border: 0,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    height: 16,
    justifyContent: "center",
    padding: theme.spacing(0.5),
    transition: theme.hoverTransition,
    width: 16,
  },
  clearSearchButtonIcon: {
    "& rect": {
      fill: theme.palette.white,
      stroke: theme.palette.white,
      strokeWidth: 2,
    },
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
    height: "100%",
    overflowY: "auto",
  },
  searchIcon: {
    marginRight: theme.spacing(1.25),
  },
  searchInput: {
    border: 0,
    outline: 0,
    padding: [theme.spacing(2), 0],
    width: "100%",
  },
  searchInputContainer: {
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.grey.light}`,
    display: "flex",
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  tokenBalance: {
    color: theme.palette.black,
  },
  tokenBalanceWrapper: {
    marginLeft: "auto",
  },
  tokenButton: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
    alignItems: "center",
    background: theme.palette.grey.light,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    justifyContent: "space-between",
    overflow: "hidden",
    padding: theme.spacing(2),
    transition: theme.hoverTransition,
    width: "100%",
  },
  tokenButtonWrapper: {
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
    position: "relative",
  },
  tokenIcon: {
    marginRight: theme.spacing(1),
  },
  tokenInfo: {
    alignItems: "center",
    display: "flex",
  },
  tokenInfoButton: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
    background: "transparent",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    height: 32,
    padding: 8,
    position: "absolute",
    right: theme.spacing(2),
    top: "50%",
    transform: "translateY(-50%)",
    width: 32,
  },
  tokenInfoButtonIcon: {
    "& path": {
      fill: theme.palette.grey.dark,
    },
  },
  tokenInfoWithBalance: {
    alignItems: "center",
    display: "flex",
    marginRight: 48,
  },
  tokenList: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
}));
