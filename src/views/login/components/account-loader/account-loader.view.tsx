import { FC } from "react";

import useAccountLoaderStyles from "src/views/login/components/account-loader/account-loader.styles";
import { WalletName } from "src/domain";
import Typography from "src/views/shared/typography/typography.view";
import WalletIcon from "../wallet-icon/wallet-icon.view";

interface AccountLoaderProps {
  selectedWallet: WalletName;
}

const AccountLoader: FC<AccountLoaderProps> = ({ selectedWallet }) => {
  const classes = useAccountLoaderStyles();

  return (
    <div className={classes.accountLoader}>
      <WalletIcon walletName={selectedWallet} size="lg" className={classes.walletIcon} />
      <Typography type="body1" className={classes.walletName}>
        {selectedWallet}
      </Typography>
      <Typography type="body2" className={classes.hint}>
        Follow the instructions in {selectedWallet}
      </Typography>
    </div>
  );
};

export default AccountLoader;
