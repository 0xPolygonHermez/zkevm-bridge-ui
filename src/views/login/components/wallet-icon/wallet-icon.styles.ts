import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useWalletIconStyles = createUseStyles((theme: Theme) => ({
  walletIcon: ({ size }: { size: "sm" | "lg" }) => ({
    borderRadius: "50%",
    height: size === "sm" ? theme.spacing(6) : theme.spacing(7.5),
    width: size === "sm" ? theme.spacing(6) : theme.spacing(7.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1),
  }),
  metaMaskIcon: {
    background: "#fbe6df",
  },
  walletConnectIcon: {
    background: "#e2f0ff",
  },
}));

export default useWalletIconStyles;
