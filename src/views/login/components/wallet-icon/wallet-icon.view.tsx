import { FC } from "react";

import { WalletName } from "src/domain";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { ReactComponent as WalletConnectIcon } from "src/assets/icons/walletconnect.svg";
import useWalletIconStyles from "src/views/login/components/wallet-icon/wallet-icon.styles";

interface WalletIconProps {
  walletName: WalletName;
  size: "sm" | "lg";
  className?: string;
}

const WalletIcon: FC<WalletIconProps> = ({ walletName, size, className }) => {
  const classes = useWalletIconStyles({ size });

  switch (walletName) {
    case WalletName.METAMASK: {
      return (
        <div className={`${classes.walletIcon} ${classes.metaMaskIcon} ${className || ""}`}>
          <MetaMaskIcon />
        </div>
      );
    }
    case WalletName.WALLET_CONNECT: {
      return (
        <div className={`${classes.walletIcon} ${classes.walletConnectIcon} ${className || ""}`}>
          <WalletConnectIcon />
        </div>
      );
    }
  }
};

export default WalletIcon;
