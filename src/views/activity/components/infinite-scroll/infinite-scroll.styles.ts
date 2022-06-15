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
}));

export default useInfiniteScrollStyles;
