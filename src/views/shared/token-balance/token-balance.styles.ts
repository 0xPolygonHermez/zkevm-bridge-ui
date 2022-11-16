import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTokenBalanceStyles = createUseStyles((theme: Theme) => ({
  loader: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(0.25),
  },
}));

export default useTokenBalanceStyles;
