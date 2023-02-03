import { FC } from "react";

import { isChainCustomToken } from "src/adapters/storage";
import { ReactComponent as DeleteIcon } from "src/assets/icons/delete.svg";
import { Chain, Token } from "src/domain";
import { useTokenInfoStyles } from "src/views/home/components/token-info/token-info.styles";
import { TokenInfoTable } from "src/views/home/components/token-info-table/token-info-table.view";
import { TokenSelectorHeader } from "src/views/home/components/token-selector-header/token-selector-header.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface TokenInfoProps {
  chain: Chain;
  onClose: () => void;
  onNavigateToTokenList: () => void;
  onRemoveToken: (token: Token) => void;
  token: Token;
}

export const TokenInfo: FC<TokenInfoProps> = ({
  chain,
  onClose,
  onNavigateToTokenList,
  onRemoveToken,
  token,
}) => {
  const classes = useTokenInfoStyles();

  const isImportedCustomToken = isChainCustomToken(token, chain);

  return (
    <div className={classes.tokenInfo}>
      <TokenSelectorHeader onClose={onClose} onGoBack={onNavigateToTokenList} title={token.name} />
      <TokenInfoTable className={classes.tokenInfoTable} token={token} />
      {isImportedCustomToken && (
        <button className={classes.removeTokenButton} onClick={() => onRemoveToken(token)}>
          <DeleteIcon /> <Typography type="body1">Remove custom token</Typography>
        </button>
      )}
    </div>
  );
};
