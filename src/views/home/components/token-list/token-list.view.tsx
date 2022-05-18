import React, { FC } from "react";

import useListStyles from "src/views/home/components/token-list/token-list.styles";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Portal from "src/views/shared/portal/portal.view";
import { Token } from "src/domain";

interface TokenListProps {
  tokens: Token[];
  selected: Token;
  onClick: (token: Token) => void;
  onClose: () => void;
}

const TokenList: FC<TokenListProps> = ({ tokens, selected, onClick, onClose }) => {
  const classes = useListStyles();

  const onOutsideClick = (event: React.MouseEvent) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  return (
    <Portal>
      <div className={classes.background} onClick={onOutsideClick}>
        <Card className={classes.card}>
          <div className={classes.list}>
            {tokens.slice(0, 20).map((token) => (
              <button
                className={classes.button}
                key={token.address}
                disabled={token.address === selected.address}
                onClick={() => onClick(token)}
              >
                <Icon url={token.logoURI} size={24} />
                <Typography type="body1">{token.name}</Typography>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </Portal>
  );
};

export default TokenList;
