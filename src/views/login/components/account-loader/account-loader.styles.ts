import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useAccountLoaderStyles = createUseStyles((theme: Theme) => ({
  accountLoader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  walletIcon: {
    marginTop: theme.spacing(2),
  },
  walletName: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  hint: {
    marginBottom: theme.spacing(4),
  },
}));

export default useAccountLoaderStyles;
