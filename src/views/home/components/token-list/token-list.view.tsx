import React, { FC, useState } from "react";
import { utils as ethersUtils } from "ethers";

import useListStyles from "src/views/home/components/token-list/token-list.styles";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Portal from "src/views/shared/portal/portal.view";
import { Token, Chain } from "src/domain";
import { useBridgeContext } from "src/contexts/bridge.context";

interface TokenListProps {
  tokens: Token[];
  selected: Token;
  chain: Chain;
  onClick: (token: Token) => void;
  onClose: () => void;
}

const TokenList: FC<TokenListProps> = ({ tokens, selected, chain, onClick, onClose }) => {
  const { getTokenFromAddress } = useBridgeContext();
  const classes = useListStyles();
  const [filteredTokens, setFilteredTokens] = useState<Token[]>(tokens);
  const [addressInputValue, setAddressInputValue] = useState<string>("");

  const onOutsideClick = (event: React.MouseEvent) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  const onAddressInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setAddressInputValue(value);

    const filterResult = tokens.filter(getTokenFilterByTerm(value));
    setFilteredTokens(filterResult);

    // if (ethersUtils.isAddress(value) && filterResult.length === 0) {
    if (ethersUtils.isAddress(value)) {
      void getTokenFromAddress({
        address: value,
        chain,
      })
        .then((token) => {
          setFilteredTokens([token]);
        })
        .catch(console.error);
    }
  };

  return (
    <Portal>
      <div className={classes.background} onClick={onOutsideClick}>
        <Card className={classes.card}>
          <input
            placeholder="Search or paste address"
            type="search"
            className={classes.addressInput}
            value={addressInputValue}
            autoFocus
            onChange={onAddressInputChange}
          />
          <div className={classes.list}>
            {filteredTokens.slice(0, 20).map((token) => (
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

const getTokenFilterByTerm = (term: string) => (token: Token) =>
  token.address.toLowerCase().includes(term.toLowerCase()) ||
  token.name.toLowerCase().includes(term.toLowerCase()) ||
  token.symbol.toLowerCase().includes(term.toLowerCase());

export default TokenList;
