import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";
import { WalletIconSize } from "src/views/login/components/wallet-icon/wallet-icon.view";

interface WalletIconStylesProps {
  size: WalletIconSize;
}

const useWalletIconStyles = createUseStyles((theme: Theme) => ({
  metaMaskIcon: {
    background: "#fbe6df",
  },
  walletConnectIcon: {
    background: "#e2f0ff",
  },
  walletIcon: ({ size }: WalletIconStylesProps) => ({
    alignItems: "center",
    borderRadius: "50%",
    display: "flex",
    height: size === "sm" ? theme.spacing(6) : theme.spacing(7.5),
    justifyContent: "center",
    padding: theme.spacing(1),
    width: size === "sm" ? theme.spacing(6) : theme.spacing(7.5),
  }),
}));

export default useWalletIconStyles;
