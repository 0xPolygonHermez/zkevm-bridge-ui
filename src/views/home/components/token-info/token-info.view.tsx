import { FC } from "react";

import Typography from "src/views/shared/typography/typography.view";
import { ReactComponent as DeleteIcon } from "src/assets/icons/delete.svg";
import useTokenInfoStyles from "src/views/home/components/token-info/token-info.styles";
import { isChainCustomToken } from "src/adapters/storage";
import { Chain, Token } from "src/domain";
import TokenInfoTable from "src/views/home/components/token-info-table/token-info-table.view";
import TokenSelectorHeader from "src/views/home/components/token-selector-header/token-selector-header.view";

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
      <TokenSelectorHeader title={token.name} onClose={onClose} onGoBack={onNavigateToTokenList} />
      <TokenInfoTable token={token} className={classes.tokenInfoTable} />
      {isImportedCustomToken && (
        <button className={classes.removeTokenButton} onClick={() => onRemoveToken(token)}>
          <DeleteIcon /> <Typography type="body1">Remove custom token</Typography>
        </button>
      )}
    </div>
  );
};

export default TokenInfo;
