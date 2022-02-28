import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useBaseLayoutStyles = createUseStyles((theme: Theme) => ({
  spinnerContainer: {
    height: "100%",
    width: "100%",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.palette.primary.main,
  },
}));

export default useBaseLayoutStyles;
