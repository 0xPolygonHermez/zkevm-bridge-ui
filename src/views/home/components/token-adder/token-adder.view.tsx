import { FC } from "react";
import useTokenAdderStyles from "src/views/home/components/token-adder/token-adder.styles";

import TokenInfoTable from "src/views/home/components/token-info-table/token-info-table.view";
import Typography from "src/views/shared/typography/typography.view";
import { ReactComponent as WarningIcon } from "src/assets/icons/warning.svg";
import { Token } from "src/domain";
import TokenSelectorHeader from "src/views/home/components/token-selector-header/token-selector-header.view";

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
      <TokenSelectorHeader title="Add token" onClose={onClose} onGoBack={onNavigateToTokenList} />
      <div className={classes.disclaimerBox}>
        <WarningIcon className={classes.disclaimerBoxWarningIcon} />
        <Typography type="body1" className={classes.disclaimerBoxMessage}>
          Interact carefully with any new or suspicious token
        </Typography>
      </div>
      <TokenInfoTable token={token} className={classes.tokenInfoTable} />
      <button className={classes.addTokenButton} onClick={() => onAddToken(token)}>
        Add {token.name}
      </button>
    </div>
  );
};

export default TokenAdder;
