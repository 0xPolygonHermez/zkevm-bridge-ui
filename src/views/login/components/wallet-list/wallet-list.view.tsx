import { FC } from "react";

import { ReactComponent as CaretRightIcon } from "src/assets/icons/caret-right.svg";
import { WalletName } from "src/domain";
import { WalletIcon } from "src/views/login/components/wallet-icon/wallet-icon.view";
import { useWalletListStyles } from "src/views/login/components/wallet-list/wallet-list.styles";
import { Typography } from "src/views/shared/typography/typography.view";

interface WalletListProps {
  onSelectWallet: (walletName: WalletName) => void;
}

export const WalletList: FC<WalletListProps> = ({ onSelectWallet }) => {
  const classes = useWalletListStyles();

  return (
    <ul className={classes.walletList}>
      <li
        className={classes.wallet}
        onClick={() => onSelectWallet(WalletName.METAMASK)}
        role="button"
      >
        <WalletIcon className={classes.walletIcon} size="sm" walletName={WalletName.METAMASK} />
        <div className={classes.walletInfo}>
          <Typography className={classes.walletName} type="body1">
            {WalletName.METAMASK}
          </Typography>
          <Typography type="body2">Connect using web wallet</Typography>
        </div>
        <CaretRightIcon />
      </li>
    </ul>
  );
};
