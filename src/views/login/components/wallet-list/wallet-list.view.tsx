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
        <WalletIcon walletName={WalletName.METAMASK} size="sm" className={classes.walletIcon} />
        <div className={classes.walletInfo}>
          <Typography type="body1" className={classes.walletName}>
            {WalletName.METAMASK}
          </Typography>
          <Typography type="body2">Connect using web wallet</Typography>
        </div>
        <CaretRightIcon />
      </li>
    </ul>
  );
};

export default WalletList;
