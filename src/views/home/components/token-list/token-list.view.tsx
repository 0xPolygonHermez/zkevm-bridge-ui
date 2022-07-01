import { FC, MouseEvent } from "react";

import useListStyles from "src/views/home/components/token-list/token-list.styles";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import Portal from "src/views/shared/portal/portal.view";
import { TokenWithBalance, Chain } from "src/domain";
import Error from "src/views/shared/error/error.view";
import { AsyncTask } from "src/utils/types";
import { formatTokenAmount } from "src/utils/amounts";

interface TokenListProps {
  chain: Chain;
  customToken: AsyncTask<TokenWithBalance, string>;
  error: string | undefined;
  searchInputValue: string;
  tokens: TokenWithBalance[];
  onClose: () => void;
  onImportTokenClick: (token: TokenWithBalance) => void;
  onRemoveTokenClick: (token: TokenWithBalance) => void;
  onSearchInputValueChange: (value: string) => void;
  onSelectToken: (token: TokenWithBalance) => void;
}

const TokenList: FC<TokenListProps> = ({
  tokens,
  searchInputValue,
  error,
  customToken,
  onSelectToken,
  onClose,
  onSearchInputValueChange,
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
              tokens.map((token) => (
                <button
                  key={token.address}
                  className={classes.tokenButton}
                  onClick={() => onSelectToken(token)}
                >
                  <div className={classes.tokenInfo}>
                    <Icon url={token.logoURI} size={24} className={classes.tokenIcon} />
                    <Typography type="body1">{token.name}</Typography>
                  </div>
                  <Typography type="body2" className={classes.tokenBalance}>
                    {`${token.balance ? formatTokenAmount(token.balance, token) : "--"} ${
                      token.symbol
                    }`}
                  </Typography>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </Portal>
  );
};

export default TokenList;
