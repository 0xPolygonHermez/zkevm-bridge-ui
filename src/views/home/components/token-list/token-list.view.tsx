import { FC, MouseEvent } from "react";

import useListStyles from "src/views/home/components/token-list/token-list.styles";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Portal from "src/views/shared/portal/portal.view";
import { Token, TokenWithBalance, Chain } from "src/domain";
import Error from "src/views/shared/error/error.view";
import { isChainCustomToken } from "src/adapters/storage";
import { AsyncTask } from "src/utils/types";
import { formatTokenAmount } from "src/utils/amounts";

interface TokenListProps {
  chain: Chain;
  customToken: AsyncTask<TokenWithBalance, string>;
  error: string | undefined;
  searchInputValue: string;
  selected: Token;
  tokens: TokenWithBalance[];
  onClose: () => void;
  onImportTokenClick: (token: TokenWithBalance) => void;
  onRemoveTokenClick: (token: TokenWithBalance) => void;
  onSearchInputValueChange: (value: string) => void;
  onSelectToken: (token: TokenWithBalance) => void;
}

const TokenList: FC<TokenListProps> = ({
  tokens,
  selected,
  chain,
  searchInputValue,
  error,
  customToken,
  onSelectToken,
  onClose,
  onSearchInputValueChange,
  onImportTokenClick,
  onRemoveTokenClick,
}) => {
  const classes = useListStyles();

  const onOutsideClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const isLoading = customToken.status === "loading";

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
            {isLoading ? (
              <Typography className={classes.loading} type="body1">
                Loading...
              </Typography>
            ) : error ? (
              <Error error={error} type="body2" className={classes.error} />
            ) : (
              tokens.map((token) => {
                const isImportedCustomToken = isChainCustomToken(token, chain);
                const isNonImportedCustomToken =
                  !isImportedCustomToken &&
                  customToken.status === "successful" &&
                  customToken.data.address === token.address;
                const isSelected = token.address === selected.address;
                return (
                  <div className={classes.tokenWrapper} key={token.address}>
                    <button
                      className={classes.tokenMainButton}
                      disabled={isSelected}
                      onClick={() => onSelectToken(token)}
                    >
                      <Icon url={token.logoURI} size={24} />
                      <Typography type="body1">{`${token.name} (${
                        token.balance ? formatTokenAmount(token.balance, token) : "--"
                      } ${token.symbol})`}</Typography>
                    </button>
                    {isImportedCustomToken && (
                      <button
                        className={classes.tokenAccessoryButton}
                        disabled={isSelected}
                        onClick={() => onRemoveTokenClick(token)}
                      >
                        <Typography type="body1">Remove</Typography>
                      </button>
                    )}
                    {isNonImportedCustomToken && (
                      <button
                        className={classes.tokenAccessoryButton}
                        disabled={isSelected}
                        onClick={() => {
                          onImportTokenClick(token);
                        }}
                      >
                        <Typography type="body1">Import</Typography>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </Portal>
  );
};

export default TokenList;
