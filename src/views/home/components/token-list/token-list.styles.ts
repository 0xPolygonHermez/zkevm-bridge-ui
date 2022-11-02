import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenListStyles = createUseStyles((theme: Theme) => ({
  tokenList: {
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: [theme.spacing(0.5), 0],
    margin: [theme.spacing(2)],
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
    border: 0,
    padding: theme.spacing(0.5),
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    transition: theme.hoverTransition,
    background: theme.palette.grey.dark,
    "&:hover": {
      background: theme.palette.black,
    },
  },
  clearSearchButtonIcon: {
    "& rect": {
      fill: theme.palette.white,
      strokeWidth: 2,
      stroke: theme.palette.white,
    },
  },
  list: {
    overflowY: "auto",
    height: 376,
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
  centeredElement: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tokenButtonWrapper: {
    position: "relative",
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
  },
  tokenButton: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    background: theme.palette.grey.light,
    borderRadius: 8,
    overflow: "hidden",
    border: "none",
    cursor: "pointer",
    padding: theme.spacing(2),
    transition: theme.hoverTransition,
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
  addTokenButton: {
    position: "absolute",
    top: 10,
    right: 10,
    border: "none",
    minWidth: 120,
    cursor: "pointer",
    borderRadius: 8,
    background: theme.palette.white,
    padding: 8,
    "&:hover": {
      background: theme.palette.grey.main,
    },
  },
  tokenRightElements: {
    position: "absolute",
    top: 12,
    right: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  tokenBalance: {
    color: theme.palette.black,
    marginRight: theme.spacing(1),
  },
  tokenInfoButton: {
    border: "none",
    height: 32,
    width: 32,
    padding: 8,
    background: "transparent",
    cursor: "pointer",
    borderRadius: "50%",
    "&:hover": {
      background: theme.palette.grey.main,
    },
  },
  tokenInfoButtonIcon: {
    "& path": {
      fill: theme.palette.grey.dark,
    },
  },
}));

export default useTokenListStyles;
