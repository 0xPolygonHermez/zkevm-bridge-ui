import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useWalletListStyles = createUseStyles((theme: Theme) => ({
  walletList: {
    listStyle: "none",
    paddingLeft: 0,
    margin: 0,
  },
  wallet: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: [theme.spacing(3), theme.spacing(4)],
    cursor: "pointer",
    transition: theme.hoverTransition,
    "&:hover": {
      background: "#e2e5ee",
    },
  },
  walletIcon: {
    marginRight: theme.spacing(2),
  },
  walletInfo: {
    display: "flex",
    alignItems: "center",
  },
  walletName: {
    marginBottom: theme.spacing(1),
  },
}));

export default useWalletListStyles;
