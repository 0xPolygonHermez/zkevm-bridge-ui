import { FC, useEffect, useState, useCallback } from "react";
import { BigNumber, constants as ethersConstants, utils as ethersUtils } from "ethers";

import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useBridgeFormStyles from "src/views/home/components/bridge-form/bridge-form.styles";
import ChainList from "src/views/home/components/chain-list/chain-list.view";
import TokenList from "src/views/home/components/token-list/token-list.view";
import AmountInput from "src/views/home/components/amount-input/amount-input.view";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import Error from "src/views/shared/error/error.view";
import Icon from "src/views/shared/icon/icon.view";
import Button from "src/views/shared/button/button.view";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { AsyncTask } from "src/utils/types";
import { formatTokenAmount } from "src/utils/amounts";
import { selectTokenAddress } from "src/utils/tokens";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import { getChainCustomTokens, addCustomToken, removeCustomToken } from "src/adapters/storage";
import { Chain, Token, FormData } from "src/domain";
import { getEtherToken } from "src/constants";
import Spinner from "src/views/shared/spinner/spinner.view";

interface BridgeFormProps {
  account: string;
  formData?: FormData;
  maxEtherBridge?: BigNumber;
  onResetForm: () => void;
  onSubmit: (formData: FormData) => void;
}

interface SelectedChains {
  from: Chain;
  to: Chain;
}

const BridgeForm: FC<BridgeFormProps> = ({
  account,
  formData,
  maxEtherBridge,
  onResetForm,
  onSubmit,
}) => {
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeFormStyles();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { getErc20TokenBalance, tokens: defaultTokens, getTokenFromAddress } = useTokensContext();
  const { connectedProvider } = useProvidersContext();
  const [balanceTo, setBalanceTo] = useState<BigNumber>();
  const [inputError, setInputError] = useState<string>();
  const [selectedChains, setSelectedChains] = useState<SelectedChains>();
  const [token, setToken] = useState<Token>();
  const [amount, setAmount] = useState<BigNumber>();
  const [chains, setChains] = useState<Chain[]>();
  const [tokens, setTokens] = useState<Token[]>();
  const [filteredTokens, setFilteredTokens] = useState<Token[]>();
  const [tokenListSearchInputValue, setTokenListSearchInputValue] = useState<string>("");
  const [tokenListCustomToken, setTokenListCustomToken] = useState<AsyncTask<Token, string>>({
    status: "pending",
  });

  const getTokens = useCallback(
    (chain: Chain) => {
      return [...getChainCustomTokens(chain), ...(defaultTokens || [getEtherToken(chain)])];
    },
    [defaultTokens]
  );

  const getTokenFilterByTerm = (term: string) => (token: Token) =>
    term.length === 0 ||
    token.address.toLowerCase().includes(term.toLowerCase()) ||
    (token.wrappedToken && token.wrappedToken.address.toLowerCase().includes(term.toLowerCase())) ||
    token.name.toLowerCase().includes(term.toLowerCase()) ||
    token.symbol.toLowerCase().includes(term.toLowerCase());

  const onAmountInputChange = ({ amount, error }: { amount?: BigNumber; error?: string }) => {
    setAmount(amount);
    setInputError(error);
  };

  const onChainButtonClick = (from: Chain) => {
    if (env) {
      const to = env.chains.find((chain) => chain.key !== from.key);

      if (to) {
        setSelectedChains({ from, to });
        setChains(undefined);
        setAmount(undefined);
      }
    }
  };

  const onTokenDropdownClick = () => {
    setFilteredTokens(tokens);
  };

  const onTokenListTokenSelected = (token: Token) => {
    setToken(token);
    setFilteredTokens(undefined);
    setAmount(undefined);
  };

  const updateTokenList = (tokensWithBalance: Token[], tokenListSearchTerm: string) => {
    const filteredTokens = tokensWithBalance.filter(getTokenFilterByTerm(tokenListSearchTerm));
    setFilteredTokens(filteredTokens);
    setTokenListCustomToken({ status: "pending" });
    if (
      selectedChains &&
      ethersUtils.isAddress(tokenListSearchTerm) &&
      filteredTokens.length === 0
    ) {
      setTokenListCustomToken({ status: "loading" });
      const setBalanceAndListCustomToken = (token: Token) => {
        getTokenBalance(token, selectedChains.from)
          .then((balance) => {
            callIfMounted(() => {
              setFilteredTokens([{ ...token, balance }]);
              setTokenListCustomToken({ status: "successful", data: { ...token, balance } });
            });
          })
          .catch(() => {
            callIfMounted(() => {
              setFilteredTokens([{ ...token, balance: undefined }]);
            });
          });
      };
      void getTokenFromAddress({
        address: tokenListSearchTerm,
        chain: selectedChains.from,
      })
        .then(setBalanceAndListCustomToken)
        .catch(() =>
          getTokenFromAddress({
            address: tokenListSearchTerm,
            chain: selectedChains.to,
          })
            .then(setBalanceAndListCustomToken)
            .catch(() =>
              callIfMounted(() => {
                setTokenListCustomToken({
                  status: "failed",
                  error:
                    "The token contract cannot be called on any network. Please make sure the contract is deployed on a network.",
                });
              })
            )
        );
    }
  };

  const onTokenListClosed = () => {
    setFilteredTokens(undefined);
    setTokenListCustomToken({ status: "pending" });
    setTokenListSearchInputValue("");
  };

  const onTokenListImportToken = (token: Token) => {
    if (tokens) {
      // we don't want to store the balance of the user in the local storage
      const { name, symbol, address, decimals, chainId, logoURI, wrappedToken } = token;
      addCustomToken({ name, symbol, address, decimals, chainId, logoURI, wrappedToken });
      const newTokensWithBalance = [token, ...tokens];
      setTokens(newTokensWithBalance);
      updateTokenList(newTokensWithBalance, tokenListSearchInputValue);
    }
  };

  const onTokenListRemoveToken = (tokenToRemove: Token) => {
    if (tokens) {
      removeCustomToken(tokenToRemove);
      const newTokensWithBalance = tokens.filter((tkn) => tkn.address !== tokenToRemove.address);
      setTokens(newTokensWithBalance);
      updateTokenList(newTokensWithBalance, tokenListSearchInputValue);
      if (selectedChains && tokenToRemove.address === token?.address) {
        setToken(getEtherToken(selectedChains.from));
      }
    }
  };

  const onTokenListSearchInputChange = (value: string): void => {
    if (tokens) {
      setTokenListSearchInputValue(value);
      updateTokenList(tokens, value);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChains && token && amount) {
      onSubmit({
        token: token,
        from: selectedChains.from,
        to: selectedChains.to,
        amount: amount,
      });
    }
  };

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

  useEffect(() => {
    // Load the balances of all the tokens in the primary network (From)
    if (selectedChains) {
      const tokens = getTokens(selectedChains.from);
      void Promise.all(
        tokens.map(
          (token: Token): Promise<Token> =>
            getTokenBalance(token, selectedChains.from)
              .then((balance) => ({ ...token, balance }))
              .catch(() => ({ ...token, balance: undefined }))
        )
      ).then((tokensWithBalance) => {
        callIfMounted(() => {
          setTokens(tokensWithBalance);
        });
      });
    }
  }, [selectedChains, callIfMounted, getTokenBalance, getTokens]);

  useEffect(() => {
    // Load the balance of the selected token in the secondary network (To)
    if (selectedChains && token) {
      const isTokenEther = token.address === ethersConstants.AddressZero;
      if (isTokenEther) {
        void selectedChains.to.provider
          .getBalance(account)
          .then((balance) =>
            callIfMounted(() => {
              setBalanceTo(balance);
            })
          )
          .catch((error) => {
            callIfMounted(() => {
              notifyError(error);
              setBalanceTo(undefined);
            });
          });
      } else {
        getErc20TokenBalance({
          chain: selectedChains.to,
          tokenAddress: selectTokenAddress(token, selectedChains.to),
          accountAddress: account,
        })
          .then((balance) =>
            callIfMounted(() => {
              setBalanceTo(balance);
            })
          )
          .catch(() =>
            callIfMounted(() => {
              setBalanceTo(undefined);
            })
          );
      }
    }
  }, [selectedChains, account, token, getErc20TokenBalance, notifyError, callIfMounted]);

  useEffect(() => {
    // Load the default values after the network is changed
    if (env && connectedProvider && formData === undefined) {
      const from = env.chains.find((chain) => chain.chainId === connectedProvider.chainId);
      const to = env.chains.find((chain) => chain.chainId !== connectedProvider.chainId);
      if (from && to) {
        setSelectedChains({ from, to });
        setToken(getEtherToken(from));
      }
      setAmount(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedProvider, env]);

  useEffect(() => {
    // Load default form values
    if (formData) {
      setSelectedChains({ from: formData.from, to: formData.to });
      setToken(formData.token);
      setAmount(formData.amount);
      onResetForm();
    }
  }, [formData, onResetForm]);

  if (!env || !selectedChains || !token || !maxEtherBridge) {
    return (
      <div className={classes.spinner}>
        <Spinner />
      </div>
    );
  }

  const fromBalance = tokens?.find((tkn) => tkn.address === token.address)?.balance;

  const tokenListSearchError =
    tokenListCustomToken.status === "failed"
      ? "Token not supported"
      : tokenListSearchInputValue.length > 0 && filteredTokens && filteredTokens.length === 0
      ? "No result found"
      : undefined;

  return (
    <form className={classes.form} onSubmit={onFormSubmit}>
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.leftBox}>
            <Typography type="body2">From</Typography>
            <div className={classes.chain}>
              <selectedChains.from.Icon />
              <Typography type="body1">{selectedChains.from.name}</Typography>
            </div>
          </div>
          <div className={classes.rightBox}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">
              {`${fromBalance ? formatTokenAmount(fromBalance, token) : "--"} ${token.symbol}`}
            </Typography>
          </div>
        </div>
        <div className={`${classes.row} ${classes.middleRow}`}>
          <button className={classes.tokenSelector} onClick={onTokenDropdownClick} type="button">
            <Icon url={token.logoURI} size={24} />
            <Typography type="h2">{token.symbol}</Typography>
            <CaretDown />
          </button>
          <AmountInput
            value={amount}
            token={token}
            balance={fromBalance || BigNumber.from(0)}
            from={selectedChains.from}
            maxEtherBridge={maxEtherBridge}
            onChange={onAmountInputChange}
          />
        </div>
      </Card>
      <div className={classes.arrowRow}>
        <ArrowDown className={classes.arrowDownIcon} />
      </div>
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.leftBox}>
            <Typography type="body2">To</Typography>
            <div className={classes.chain}>
              <selectedChains.to.Icon />
              <Typography type="body1">{selectedChains.to.name}</Typography>
            </div>
          </div>
          <div className={classes.rightBox}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">
              {`${balanceTo ? formatTokenAmount(balanceTo, token) : "--"} ${token.symbol}`}
            </Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <Button type="submit" disabled={!amount || amount.isZero() || inputError !== undefined}>
          Continue
        </Button>
        {amount && inputError && <Error error={inputError} />}
      </div>
      {chains && (
        <ChainList
          chains={chains}
          onClick={onChainButtonClick}
          onClose={() => setChains(undefined)}
        />
      )}
      {filteredTokens && (
        <TokenList
          chain={selectedChains.from}
          customToken={tokenListCustomToken}
          error={tokenListSearchError}
          searchInputValue={tokenListSearchInputValue}
          tokens={filteredTokens}
          onClose={onTokenListClosed}
          onImportTokenClick={onTokenListImportToken}
          onRemoveTokenClick={onTokenListRemoveToken}
          onSearchInputValueChange={onTokenListSearchInputChange}
          onSelectToken={onTokenListTokenSelected}
        />
      )}
    </form>
  );
};

export default BridgeForm;
