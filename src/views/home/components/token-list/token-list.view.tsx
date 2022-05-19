import React, { FC, useState } from "react";
import { utils as ethersUtils } from "ethers";

import useListStyles from "src/views/home/components/token-list/token-list.styles";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Portal from "src/views/shared/portal/portal.view";
import { Token, Chain } from "src/domain";
import { useBridgeContext } from "src/contexts/bridge.context";
import Error from "src/views/shared/error/error.view";
import { getCustomTokens, addCustomToken, removeCustomToken } from "src/adapters/storage";

interface TokenListProps {
  tokens: Token[];
  selected: Token;
  chain: Chain;
  onSelectToken: (token: Token) => void;
  onClose: () => void;
}

const TokenList: FC<TokenListProps> = ({ tokens, selected, chain, onSelectToken, onClose }) => {
  const { getTokenFromAddress } = useBridgeContext();
  const classes = useListStyles();
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([...getCustomTokens(), ...tokens]);
  const [customToken, setCustomToken] = useState<Token>();
  const [searchInputValue, setSearchInputValue] = useState<string>("");

  const onOutsideClick = (event: React.MouseEvent) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  const onImportTokenClick = (token: Token) => {
    addCustomToken(token);
    const all = [...getCustomTokens(), ...tokens];
    const filtered = searchInputValue.length
      ? all.filter(getTokenFilterByTerm(searchInputValue))
      : all;
    setFilteredTokens(filtered);
  };

  const onRemoveTokenClick = (token: Token) => {
    removeCustomToken(token);
    const all = [...(customToken ? [customToken] : []), ...getCustomTokens(), ...tokens];
    const filtered = searchInputValue.length
      ? all.filter(getTokenFilterByTerm(searchInputValue))
      : all;
    setFilteredTokens(filtered);
  };

  const onSearchInputValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchInputValue(value);
    setCustomToken(undefined);

    const all = [...getCustomTokens(), ...tokens];
    const filtered = value.length ? all.filter(getTokenFilterByTerm(value)) : all;
    setFilteredTokens(filtered);

    if (ethersUtils.isAddress(value) && filtered.length === 0) {
      void getTokenFromAddress({
        address: value,
        chain,
      }).then((token) => {
        setCustomToken(token);
        setFilteredTokens([token]);
      });
    }
  };

  return (
    <Portal>
      <div className={classes.background} onClick={onOutsideClick}>
        <Card className={classes.card}>
          <input
            placeholder="Search or paste address"
            type="search"
            className={classes.searchInput}
            value={searchInputValue}
            autoFocus
            onChange={onSearchInputValueChange}
          />
          <div className={classes.list}>
            {filteredTokens.slice(0, 20).map((token) => {
              const isCustomToken =
                tokens.find((tkn) => tkn.address === token.address) === undefined;
              const isImportedCustomToken =
                getCustomTokens().find((tkn) => tkn.address === token.address) !== undefined;
              const isDisabled = token.address === selected.address;
              return (
                <div
                  className={`${classes.tokenWrapper} ${
                    isDisabled ? classes.disabledTokenWrapper : classes.enabledTokenWrapper
                  }`}
                  key={token.address}
                >
                  <button
                    className={classes.tokenMainButton}
                    disabled={isDisabled}
                    onClick={() => onSelectToken(token)}
                  >
                    <Icon url={token.logoURI} size={24} />
                    <Typography type="body1">{token.name}</Typography>
                  </button>
                  {isImportedCustomToken && (
                    <button
                      className={classes.tokenAccessoryButton}
                      disabled={isDisabled}
                      onClick={() => onRemoveTokenClick(token)}
                    >
                      <Typography type="body1">Remove</Typography>
                    </button>
                  )}
                  {isCustomToken && !isImportedCustomToken && (
                    <button
                      className={classes.tokenAccessoryButton}
                      disabled={customToken === undefined}
                      onClick={() => {
                        if (customToken) {
                          onImportTokenClick(customToken);
                        }
                      }}
                    >
                      <Typography type="body1">Import</Typography>
                    </button>
                  )}
                </div>
              );
            })}
            {filteredTokens.length === 0 && (
              <Error
                error={`The input "${searchInputValue}" produced no matches`}
                type="body2"
                className={classes.error}
              />
            )}
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
