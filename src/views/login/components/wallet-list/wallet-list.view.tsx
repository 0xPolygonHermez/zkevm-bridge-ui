import { FC } from "react";

import useWalletListStyles from "src/views/login/components/wallet-list/wallet-list.styles";
import { WalletName } from "src/domain";
import { ReactComponent as CaretRightIcon } from "src/assets/icons/caret-right.svg";
import Typography from "src/views/shared/typography/typography.view";
import WalletIcon from "src/views/login/components/wallet-icon/wallet-icon.view";

interface WalletListProps {
  onSelectWallet: (walletName: WalletName) => void;
}

const WalletList: FC<WalletListProps> = ({ onSelectWallet }) => {
  const classes = useWalletListStyles();

  return (
    <ul className={classes.walletList}>
      <li
        className={classes.wallet}
        role="button"
        onClick={() => onSelectWallet(WalletName.METAMASK)}
      >
        <div className={classes.walletInfo}>
          <WalletIcon walletName={WalletName.METAMASK} size="sm" className={classes.walletIcon} />
          <div>
            <Typography type="body1" className={classes.walletName}>
              MetaMask
            </Typography>
            <Typography type="body2">Connect using web wallet</Typography>
          </div>
        </div>
        <CaretRightIcon />
      </li>
      <li
        className={classes.wallet}
        role="button"
        onClick={() => onSelectWallet(WalletName.WALLET_CONNECT)}
      >
        <div className={classes.walletInfo}>
          <WalletIcon
            walletName={WalletName.WALLET_CONNECT}
            size="sm"
            className={classes.walletIcon}
          />
          <div>
            <Typography type="body1" className={classes.walletName}>
              WalletConnect
            </Typography>
            <Typography type="body2">Connect using mobile wallet</Typography>
          </div>
        </div>
        <CaretRightIcon />
      </li>
    </ul>
  );
};

export default WalletList;
