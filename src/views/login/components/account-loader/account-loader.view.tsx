import { FC } from "react";

import useAccountLoaderStyles from "src/views/login/components/account-loader/account-loader.styles";
import { WalletName } from "src/domain";
import Typography from "src/views/shared/typography/typography.view";
import WalletIcon from "../wallet-icon/wallet-icon.view";

const walletLabels = {
  [WalletName.METAMASK]: "MetaMask",
  [WalletName.WALLET_CONNECT]: "WalletConnect",
};

interface AccountLoaderProps {
  selectedWallet: WalletName;
}

const AccountLoader: FC<AccountLoaderProps> = ({ selectedWallet }) => {
  const classes = useAccountLoaderStyles();

  return (
    <div className={classes.accountLoader}>
      <WalletIcon walletName={selectedWallet} size="lg" className={classes.walletIcon} />
      <Typography type="body1" className={classes.walletName}>
        {walletLabels[selectedWallet]}
      </Typography>
      <Typography type="body2" className={classes.hint}>
        Follow the instructions in {walletLabels[selectedWallet]}
      </Typography>
    </div>
  );
};

export default AccountLoader;
