import { FC } from "react";
import { ReactComponent as WarningIcon } from "src/assets/icons/warning.svg";
import { Token } from "src/domain";
import { useTokenAdderStyles } from "src/views/home/components/token-adder/token-adder.styles";

import { TokenInfoTable } from "src/views/home/components/token-info-table/token-info-table.view";
import { TokenSelectorHeader } from "src/views/home/components/token-selector-header/token-selector-header.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface TokenAdderProps {
  onAddToken: (token: Token) => void;
  onClose: () => void;
  onNavigateToTokenList: () => void;
  token: Token;
}

export const TokenAdder: FC<TokenAdderProps> = ({
  onAddToken,
  onClose,
  onNavigateToTokenList,
  token,
}) => {
  const classes = useTokenAdderStyles();

  return (
    <div className={classes.tokenAdder}>
      <TokenSelectorHeader onClose={onClose} onGoBack={onNavigateToTokenList} title="Add token" />
      <div className={classes.disclaimerBox}>
        <WarningIcon className={classes.disclaimerBoxWarningIcon} />
        <Typography className={classes.disclaimerBoxMessage} type="body1">
          Interact carefully with any new or suspicious token
        </Typography>
      </div>
      <TokenInfoTable className={classes.tokenInfoTable} token={token} />
      <button className={classes.addTokenButton} onClick={() => onAddToken(token)}>
        Add {token.name}
      </button>
    </div>
  );
};
