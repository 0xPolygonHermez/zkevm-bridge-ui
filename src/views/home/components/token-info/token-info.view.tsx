import { FC } from "react";

import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import { ReactComponent as ArrowLeftIcon } from "src/assets/icons/arrow-left.svg";
import { ReactComponent as XMarkIcon } from "src/assets/icons/xmark.svg";
import { ReactComponent as DeleteIcon } from "src/assets/icons/delete.svg";
import useTokenInfoStyles from "src/views/home/components/token-info/token-info.styles";
import { isChainCustomToken } from "src/adapters/storage";
import { Chain, Token } from "src/domain";
import TokenInfoTable from "src/views/home/components/token-info-table/token-info-table.view";

interface TokenInfoProps {
  chain: Chain;
  token: Token;
  onClose: () => void;
  onNavigateToTokenList: () => void;
  onRemoveToken: (token: Token) => void;
}

const TokenInfo: FC<TokenInfoProps> = ({
  chain,
  token,
  onClose,
  onNavigateToTokenList,
  onRemoveToken,
}) => {
  const classes = useTokenInfoStyles();

  const isImportedCustomToken = isChainCustomToken(token, chain);

  return (
    <div className={classes.tokenInfo}>
      <div className={classes.header}>
        <button className={classes.backButton} onClick={onNavigateToTokenList}>
          <ArrowLeftIcon className={classes.backButtonIcon} />
        </button>
        <Icon url={token.logoURI} className={classes.tokenIcon} size={28} />
        <Typography type="h2">{`${token.name} (${token.symbol})`}</Typography>
        <button className={classes.closeButton} onClick={onClose}>
          <XMarkIcon className={classes.closeButtonIcon} />
        </button>
      </div>
      <TokenInfoTable token={token} className={classes.tokenDetails} />
      {isImportedCustomToken && (
        <button className={classes.removeTokenButton} onClick={() => onRemoveToken(token)}>
          <DeleteIcon /> <Typography type="body1">Remove custom token</Typography>
        </button>
      )}
    </div>
  );
};

export default TokenInfo;
