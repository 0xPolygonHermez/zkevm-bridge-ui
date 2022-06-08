import { FC, useState, useCallback, MouseEvent } from "react";
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
import { AsyncTask, isAsyncTaskDataAvailable } from "src/utils/types";
import { getChainName } from "src/utils/labels";
import useIsMounted from "src/hooks/use-is-mounted";

interface TokenListProps {
  tokens: Token[];
  selected: Token;
  chain: Chain;
  onSelectToken: (token: Token) => void;
  onClose: () => void;
}

const TokenList: FC<TokenListProps> = ({ tokens, selected, chain, onSelectToken, onClose }) => {
  const isMounted = useIsMounted();
  const { getTokenFromAddress } = useBridgeContext();
  const classes = useListStyles();
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([
    ...getCustomTokens().filter((token) => token.chainId === chain.chainId),
    ...tokens,
  ]);
  const [customToken, setCustomToken] = useState<AsyncTask<Token, string>>({ status: "pending" });
  const [searchInputValue, setSearchInputValue] = useState<string>("");

  const mountSafe = useCallback(
    <T,>(callback: (value: T) => void, value: T) => {
      if (isMounted()) {
        callback(value);
      }
    },
    [isMounted]
  );

  const onOutsideClick = (event: MouseEvent) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  const onImportTokenClick = (token: Token) => {
    const all = [...addCustomToken(token), ...tokens];
    setFilteredTokens(
      searchInputValue.length ? all.filter(getTokenFilterByTerm(searchInputValue)) : all
    );
  };

  const onRemoveTokenClick = (token: Token) => {
    const all = [...removeCustomToken(token), ...tokens];
    setFilteredTokens(
      searchInputValue.length ? all.filter(getTokenFilterByTerm(searchInputValue)) : all
    );
    onSearchInputValueChange(searchInputValue);
  };

  const onSearchInputValueChange = (value: string): void => {
    setSearchInputValue(value);

    const all = [...getCustomTokens(), ...tokens];
    const filtered = value.length ? all.filter(getTokenFilterByTerm(value)) : all;
    setFilteredTokens(filtered);
    setCustomToken({ status: "pending" });

    if (ethersUtils.isAddress(value) && filtered.length === 0) {
      setCustomToken({ status: "loading" });
      void getTokenFromAddress({
        address: value,
        chain,
      })
        .then((token) => {
          mountSafe(setCustomToken, { status: "successful", data: token });
          mountSafe(setFilteredTokens, [token]);
        })
        .catch(() =>
          mountSafe(setCustomToken, {
            status: "failed",
            error: `The token can not be imported: A problem occurred calling the provided contract on the ${getChainName(
              chain
            )} chain with id ${chain.chainId}`,
          })
        );
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
            onChange={(event) => {
              onSearchInputValueChange(event.target.value);
            }}
          />
          <div className={classes.list}>
            {filteredTokens.slice(0, 20).map((token) => {
              const isEnvToken = tokens.find((tkn) => tkn.address === token.address) !== undefined;
              const isCustomToken =
                getCustomTokens().find((tkn) => tkn.address === token.address) !== undefined;
              const isSelected = token.address === selected.address;
              return (
                <div className={classes.tokenWrapper} key={token.address}>
                  <button
                    className={classes.tokenMainButton}
                    disabled={isSelected}
                    onClick={() => onSelectToken(token)}
                  >
                    <Icon url={token.logoURI} size={24} />
                    <Typography type="body1">{token.name}</Typography>
                  </button>
                  {isCustomToken && (
                    <button
                      className={classes.tokenAccessoryButton}
                      disabled={isSelected}
                      onClick={() => onRemoveTokenClick(token)}
                    >
                      <Typography type="body1">Remove</Typography>
                    </button>
                  )}
                  {!isEnvToken && !isCustomToken && (
                    <button
                      className={classes.tokenAccessoryButton}
                      disabled={isSelected}
                      onClick={() => {
                        if (isAsyncTaskDataAvailable(customToken)) {
                          onImportTokenClick(customToken.data);
                        }
                      }}
                    >
                      <Typography type="body1">Import</Typography>
                    </button>
                  )}
                </div>
              );
            })}
            {customToken.status === "failed" ? (
              <Error error={customToken.error} type="body2" className={classes.error} />
            ) : (
              filteredTokens.length === 0 &&
              (customToken.status === "loading" ? (
                <Typography className={classes.loading} type="body1">
                  Loading...
                </Typography>
              ) : (
                <Error
                  error={`The input "${searchInputValue}" produced no matches`}
                  type="body2"
                  className={classes.error}
                />
              ))
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
