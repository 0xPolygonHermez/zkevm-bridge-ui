import { FC, useCallback, useEffect, useRef, useState } from "react";
import { BigNumber, utils as ethersUtils, constants as ethersConstants } from "ethers";

import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";

import Spinner from "src/views/shared/spinner/spinner.view";
import { isChainCustomToken } from "src/adapters/storage";
import { AsyncTask } from "src/utils/types";
import { ReactComponent as XMarkIcon } from "src/assets/icons/xmark.svg";
import { ReactComponent as MagnifyingGlassIcon } from "src/assets/icons/magnifying-glass.svg";
import { ReactComponent as InfoIcon } from "src/assets/icons/info.svg";
import useTokenListStyles from "src/views/home/components/token-list/token-list.styles";
import { Chain, Token } from "src/domain";
import { useTokensContext } from "src/contexts/tokens.context";
import { selectTokenAddress } from "src/utils/tokens";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import TokenBalance from "src/views/shared/token-balance/token-balance.view";

interface SelectedChains {
  from: Chain;
  to: Chain;
}

interface TokenListProps {
  account: string;
  chains: SelectedChains;
  tokens?: Token[];
  onClose: () => void;
  onNavigateToTokenDetails: (token: Token) => void;
  onNavigateToTokenAdder: (token: Token) => void;
  onSelectToken: (token: Token) => void;
}

const TokenList: FC<TokenListProps> = ({
  account,
  chains,
  tokens,
  onClose,
  onNavigateToTokenAdder,
  onNavigateToTokenDetails,
  onSelectToken,
}) => {
  const classes = useTokenListStyles();
  const callIfMounted = useCallIfMounted();
  const { addWrappedToken, getErc20TokenBalance, getTokenFromAddress } = useTokensContext();
  const [searchInputValue, setSearchInputValue] = useState<string>("");
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [customToken, setCustomToken] = useState<AsyncTask<Token, string>>({
    status: "pending",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const getTokenBalance = useCallback(
    (token: Token, chain: Chain): Promise<BigNumber> => {
      if (token.address === ethersConstants.AddressZero) {
        return chain.provider.getBalance(account);
      } else {
        return getErc20TokenBalance({
          chain: chain,
          tokenAddress: selectTokenAddress(token, chain),
          accountAddress: account,
        });
      }
    },
    [account, getErc20TokenBalance]
  );

  const getTokenFilterByTerm = (term: string) => (token: Token) =>
    term.length === 0 ||
    token.address.toLowerCase().includes(term.toLowerCase()) ||
    (token.wrappedToken && token.wrappedToken.address.toLowerCase().includes(term.toLowerCase())) ||
    token.name.toLowerCase().includes(term.toLowerCase()) ||
    token.symbol.toLowerCase().includes(term.toLowerCase());

  const updateTokenList = (tokensWithBalance: Token[], searchTerm: string) => {
    const newFilteredTokens = tokensWithBalance.filter(getTokenFilterByTerm(searchTerm));

    setFilteredTokens(newFilteredTokens);
    setCustomToken({ status: "pending" });

    if (ethersUtils.isAddress(searchTerm) && newFilteredTokens.length === 0) {
      setCustomToken({ status: "loading" });

      const setBalanceAndListCustomToken = (token: Token) => {
        getTokenBalance(token, chains.from)
          .then((balance) => {
            callIfMounted(() => {
              setCustomToken((currentCustomToken) =>
                currentCustomToken.status === "pending"
                  ? currentCustomToken
                  : {
                      status: "successful",
                      data: { ...token, balance: { status: "successful", data: balance } },
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
                      status: "successful",
                      data: {
                        ...token,
                        balance: { status: "failed", error: "Couldn't retrieve token balance" },
                      },
                    }
              );
            });
          });
      };

      void getTokenFromAddress({
        address: searchTerm,
        chain: chains.from,
      })
        .then(setBalanceAndListCustomToken)
        .catch(() =>
          getTokenFromAddress({
            address: searchTerm,
            chain: chains.to,
          })
            .then(setBalanceAndListCustomToken)
            .catch(() =>
              callIfMounted(() => {
                setCustomToken({
                  status: "failed",
                  error: "The token couldn't be found on any network.",
                });
              })
            )
        );
    }
  };

  const handleSearchInputchange = (value: string): void => {
    if (tokens) {
      setSearchInputValue(value);
      updateTokenList(tokens, value);
      if (value === "") {
        setCustomToken({ status: "pending" });
      }
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
    if (tokens) {
      setFilteredTokens(tokens);
    }
  }, [tokens]);

  const error =
    customToken.status === "failed"
      ? customToken.error
      : searchInputValue.length > 0 && filteredTokens.length === 0
      ? "No result found"
      : undefined;

  return (
    <div className={classes.tokenList}>
      <div className={classes.header}>
        <Typography type="h2">Select token</Typography>
        <button className={classes.closeButton} onClick={onClose}>
          <XMarkIcon className={classes.closeButtonIcon} />
        </button>
      </div>
      <div className={classes.searchInputContainer}>
        <MagnifyingGlassIcon className={classes.searchIcon} />
        <input
          autoFocus
          placeholder="Enter token name or address"
          type="search"
          className={classes.searchInput}
          value={searchInputValue}
          onChange={(event) => {
            handleSearchInputchange(event.target.value);
          }}
        />
        {searchInputValue !== "" && (
          <button className={classes.clearSearchButton} onClick={() => handleSearchInputchange("")}>
            <XMarkIcon className={classes.clearSearchButtonIcon} />
          </button>
        )}
      </div>
      <div className={classes.list}>
        {customToken.status === "loading" ? (
          <div className={classes.centeredElement}>
            <Spinner size={24} />
          </div>
        ) : error ? (
          <Typography type="body2" className={classes.centeredElement}>
            {error}
          </Typography>
        ) : (
          filteredTokens.map((token) => {
            const isImportedCustomToken = isChainCustomToken(token, chains.from);
            const isNonImportedCustomToken =
              !isImportedCustomToken &&
              customToken.status === "successful" &&
              customToken.data.address === token.address;
            return (
              <div key={token.address} className={classes.tokenButtonWrapper}>
                <button
                  role="button"
                  className={classes.tokenButton}
                  onClick={() => onSelectToken(token)}
                >
                  <div className={classes.tokenInfo}>
                    <Icon url={token.logoURI} size={24} className={classes.tokenIcon} />
                    <Typography type="body1">{token.name}</Typography>
                  </div>
                </button>

                {isNonImportedCustomToken ? (
                  <button
                    className={classes.addTokenButton}
                    onClick={() => {
                      addWrappedToken({ token })
                        .then((newToken) => {
                          onNavigateToTokenAdder(newToken);
                        })
                        .catch(() => {
                          onNavigateToTokenAdder(token);
                        });
                    }}
                  >
                    <Typography type="body1">Add token</Typography>
                  </button>
                ) : (
                  <div className={classes.tokenRightElements}>
                    <TokenBalance
                      token={token}
                      spinnerSize={16}
                      typographyProps={{ type: "body2", className: classes.tokenBalance }}
                    />
                    <button
                      className={classes.tokenInfoButton}
                      onClick={() => onNavigateToTokenDetails(token)}
                    >
                      <InfoIcon className={classes.tokenInfoButtonIcon} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TokenList;
