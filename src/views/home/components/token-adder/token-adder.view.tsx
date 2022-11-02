import { FC } from "react";
import useTokenAdderStyles from "src/views/home/components/token-adder/token-adder.styles";

import TokenInfoTable from "src/views/home/components/token-info-table/token-info-table.view";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import { ReactComponent as ArrowLeftIcon } from "src/assets/icons/arrow-left.svg";
import { ReactComponent as XMarkIcon } from "src/assets/icons/xmark.svg";
import { ReactComponent as WarningIcon } from "src/assets/icons/warning.svg";
import { Token } from "src/domain";

interface TokenAdderProps {
  token: Token;
  onAddToken: (token: Token) => void;
  onClose: () => void;
  onNavigateToTokenList: () => void;
}

const TokenAdder: FC<TokenAdderProps> = ({ token, onClose, onAddToken, onNavigateToTokenList }) => {
  const classes = useTokenAdderStyles();

  return (
    <div className={classes.tokenAdder}>
      <div className={classes.header}>
        <button className={classes.backButton} onClick={onNavigateToTokenList}>
          <ArrowLeftIcon className={classes.backButtonIcon} />
        </button>
        <Icon url={token.logoURI} className={classes.tokenIcon} size={28} />
        <Typography type="h2">{`Add ${token.name} (${token.symbol})`}</Typography>
        <button className={classes.closeButton} onClick={onClose}>
          <XMarkIcon className={classes.closeButtonIcon} />
        </button>
      </div>
      <div className={classes.disclaimerBox}>
        <WarningIcon className={classes.disclaimerBoxWarningIcon} />
        <Typography type="body1" className={classes.disclaimerBoxMessage}>
          Interact carefully with any new or suspicious token
        </Typography>
      </div>
      <TokenInfoTable token={token} className={classes.tokenDetails} />
      <button className={classes.addTokenButton} onClick={() => onAddToken(token)}>
        Add {token.name}
      </button>
    </div>
  );
};

export default TokenAdder;
