import { BigNumber, utils as ethersUtils } from "ethers";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { isChainNativeCustomToken } from "src/adapters/storage";
import { ReactComponent as InfoIcon } from "src/assets/icons/info.svg";
import { ReactComponent as MagnifyingGlassIcon } from "src/assets/icons/magnifying-glass.svg";
import { ReactComponent as XMarkIcon } from "src/assets/icons/xmark.svg";
import { TOKEN_BLACKLIST } from "src/constants";
import { useTokensContext } from "src/contexts/tokens.context";
import { AsyncTask, Chain, Token } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { isTokenEther, selectTokenAddress } from "src/utils/tokens";
import { useTokenListStyles } from "src/views/home/components/token-list/token-list.styles";
import { TokenSelectorHeader } from "src/views/home/components/token-selector-header/token-selector-header.view";
import { Icon } from "src/views/shared/icon/icon.view";
import { Spinner } from "src/views/shared/spinner/spinner.view";
import { TokenBalance } from "src/views/shared/token-balance/token-balance.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface SelectedChains {
  from: Chain;
  to: Chain;
}

interface TokenListProps {
  account: string;
  chains: SelectedChains;
  onClose: () => void;
  onNavigateToTokenAdder: (token: Token) => void;
  onNavigateToTokenInfo: (token: Token) => void;
  onSelectToken: (token: Token) => void;
  tokens: Token[];
}

export const TokenList: FC<TokenListProps> = ({
  account,
  chains,
  onClose,
  onNavigateToTokenAdder,
  onNavigateToTokenInfo,
  onSelectToken,
  tokens,
}) => {
  const classes = useTokenListStyles();
  const callIfMounted = useCallIfMounted();
  const { getErc20TokenBalance, getTokenFromAddress } = useTokensContext();
  const [searchInputValue, setSearchInputValue] = useState<string>("");
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [customToken, setCustomToken] = useState<AsyncTask<Token, string>>({
    status: "pending",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const getTokenBalance = useCallback(
    (token: Token, chain: Chain): Promise<BigNumber> => {
      if (isTokenEther(token)) {
        return chain.provider.getBalance(account);
      } else {
        return getErc20TokenBalance({
          accountAddress: account,
          chain: chain,
          tokenAddress: selectTokenAddress(token, chain),
        });
      }
    },
    [account, getErc20TokenBalance]
  );

  const getTokenFilterByTerm = (chain: Chain, term: string) => (token: Token) =>
    term.length === 0 ||
    (token.address.toLowerCase().includes(term.toLowerCase()) && token.chainId === chain.chainId) ||
    (token.wrappedToken &&
      token.wrappedToken.address.toLowerCase().includes(term.toLowerCase()) &&
      token.wrappedToken.chainId === chain.chainId) ||
    token.name.toLowerCase().includes(term.toLowerCase()) ||
    token.symbol.toLowerCase().includes(term.toLowerCase());

  const updateTokenList = (tokensWithBalance: Token[], searchTerm: string) => {
    const newFilteredTokens = tokensWithBalance.filter(
      getTokenFilterByTerm(chains.from, searchTerm)
    );

    setFilteredTokens(newFilteredTokens);
    setCustomToken({ status: "pending" });

    if (ethersUtils.isAddress(searchTerm) && newFilteredTokens.length === 0) {
      if (TOKEN_BLACKLIST.includes(searchTerm)) {
        setCustomToken({
          error: "We do not support this token at the moment.",
          status: "failed",
        });
      } else {
        setCustomToken({ status: "loading" });

        void getTokenFromAddress({
          address: searchTerm,
          chain: chains.from,
        })
          .then((token: Token) => {
            getTokenBalance(token, chains.from)
              .then((balance) => {
                callIfMounted(() => {
                  setCustomToken((currentCustomToken) =>
                    currentCustomToken.status === "pending"
                      ? currentCustomToken
                      : {
                          data: { ...token, balance: { data: balance, status: "successful" } },
                          status: "successful",
                        }
                  );
                });
              })
              .catch(() => {
                callIfMounted(() => {
                  setCustomToken((currentCustomToken) =>
                    currentCustomToken.status === "pending"
                      ? currentCustomToken
                      : {
                          data: {
                            ...token,
                            balance: { error: "Couldn't retrieve token balance", status: "failed" },
                          },
                          status: "successful",
                        }
                  );
                });
              });
          })
          .catch(() =>
            callIfMounted(() => {
              setCustomToken({
                error: "The token couldn't be found on the selected network.",
                status: "failed",
              });
            })
          );
      }
    }
  };

  const onSearchInputchange = (value: string): void => {
    setSearchInputValue(value);
    updateTokenList(tokens, value);
    if (value === "") {
      setCustomToken({ status: "pending" });
    }
  };

  useEffect(() => {
    if (customToken.status === "successful") {
      setFilteredTokens([customToken.data]);
    }
  }, [customToken]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setFilteredTokens(tokens);
  }, [tokens]);

  const error =
    customToken.status === "failed"
      ? customToken.error
      : searchInputValue.length > 0 && filteredTokens.length === 0
      ? "No result found"
      : undefined;

  return (
    <div className={classes.tokenList}>
      <TokenSelectorHeader onClose={onClose} title="Select token" />
      <div className={classes.searchInputContainer}>
        <MagnifyingGlassIcon className={classes.searchIcon} />
        <input
          className={classes.searchInput}
          onChange={(event) => {
            onSearchInputchange(event.target.value);
          }}
          placeholder="Enter token name or address"
          ref={inputRef}
          type="search"
          value={searchInputValue}
        />
        {searchInputValue !== "" && (
          <button className={classes.clearSearchButton} onClick={() => onSearchInputchange("")}>
            <XMarkIcon className={classes.clearSearchButtonIcon} />
          </button>
        )}
      </div>
      <div className={classes.list}>
        {customToken.status === "loading" ? (
          <div className={classes.centeredElement}>
            <Spinner />
          </div>
        ) : error ? (
          <Typography className={classes.centeredElement} type="body2">
            {error}
          </Typography>
        ) : (
          filteredTokens.map((token) => {
            const isImportedCustomToken = isChainNativeCustomToken(token, chains.from);
            const isNonImportedCustomToken =
              !isImportedCustomToken &&
              customToken.status === "successful" &&
              customToken.data.address === token.address;

            if (isNonImportedCustomToken) {
              return (
                <div
                  className={classes.tokenButtonWrapper}
                  key={`${token.chainId}-${token.address}`}
                >
                  <button
                    className={classes.tokenButton}
                    onClick={() => onSelectToken(token)}
                    role="button"
                  >
                    <div className={classes.tokenInfo}>
                      <Icon className={classes.tokenIcon} isRounded size={24} url={token.logoURI} />
                      <Typography type="body1">{token.name}</Typography>
                    </div>
                  </button>
                  <button
                    className={classes.addTokenButton}
                    onClick={() => onNavigateToTokenAdder(token)}
                  >
                    <Typography type="body1">Add token</Typography>
                  </button>
                </div>
              );
            } else {
              return (
                <div
                  className={classes.tokenButtonWrapper}
                  key={`${token.chainId}-${token.address}`}
                >
                  <button
                    className={classes.tokenButton}
                    onClick={() => onSelectToken(token)}
                    role="button"
                  >
                    <div className={classes.tokenInfoWithBalance}>
                      <Icon className={classes.tokenIcon} isRounded size={24} url={token.logoURI} />
                      <Typography type="body1">{token.name}</Typography>
                      <div className={classes.tokenBalanceWrapper}>
                        <TokenBalance
                          spinnerSize={16}
                          token={token}
                          typographyProps={{ className: classes.tokenBalance, type: "body2" }}
                        />
                      </div>
                    </div>
                  </button>
                  <button
                    className={classes.tokenInfoButton}
                    onClick={() => onNavigateToTokenInfo(token)}
                  >
                    <InfoIcon className={classes.tokenInfoButtonIcon} />
                  </button>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
};
