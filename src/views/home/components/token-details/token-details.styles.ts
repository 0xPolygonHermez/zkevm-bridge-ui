import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenDetailsStyles = createUseStyles((theme: Theme) => ({
  wrapper: {
    background: theme.palette.white,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexDirection: "column",
    padding: [theme.spacing(2), 0],
    gap: theme.spacing(1),
    [theme.breakpoints.upSm]: {
      alignItems: "center",
      flexDirection: "row",
      padding: [theme.spacing(2), 0],
    },
  },
  alignRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
}));

export default useTokenDetailsStyles;
