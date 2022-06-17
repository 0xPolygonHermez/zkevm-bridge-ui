import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useInfiniteScrollStyles = createUseStyles((theme: Theme) => ({
  root: {
    width: "100%",
  },
  spinnerWrapper: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: theme.spacing(3),
  },
  loadMoreButtonWrapper: {
    width: "100%",
    padding: theme.spacing(2),
  },
  loadMoreButton: {
    margin: "auto",
    display: "flex",
    justifyContent: "center",
    minWidth: 150,
    border: "none",
    padding: [theme.spacing(0.75), theme.spacing(3)],
    borderRadius: 32,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.white,
    fontWeight: 700,
    lineHeight: "20px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    "&:disabled": {
      backgroundColor: theme.palette.disabled,
      cursor: "initial",
    },
  },
}));

export default useInfiniteScrollStyles;
