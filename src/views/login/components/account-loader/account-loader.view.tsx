import { FC } from "react";

import useAccountLoaderStyles from "src/views/login/components/account-loader/account-loader.styles";
import { WalletName } from "src/domain";
import Typography from "src/views/shared/typography/typography.view";
import WalletIcon from "../wallet-icon/wallet-icon.view";

interface AccountLoaderProps {
  selectedWallet?: WalletName;
}

const AccountLoader: FC<AccountLoaderProps> = ({ selectedWallet }) => {
  const classes = useAccountLoaderStyles();

  switch (selectedWallet) {
    case WalletName.METAMASK: {
      return (
        <div className={classes.accountLoader}>
          <WalletIcon walletName={WalletName.METAMASK} size="lg" className={classes.walletIcon} />
          <Typography type="body1" className={classes.walletName}>
            MetaMask
          </Typography>
          <Typography type="body2" className={classes.hint}>
            Follow the instructions in Metamask
          </Typography>
        </div>
      );
    }
    case WalletName.WALLET_CONNECT: {
      return (
        <div className={classes.accountLoader}>
          <WalletIcon
            walletName={WalletName.WALLET_CONNECT}
            size="lg"
            className={classes.walletIcon}
          />
          <Typography type="body1" className={classes.walletName}>
            WalletConnect
          </Typography>
          <Typography type="body2" className={classes.hint}>
            Follow the instructions in WalletConnect
          </Typography>
        </div>
      );
    }
    default: {
      return null;
    }
  }
};

export default AccountLoader;
