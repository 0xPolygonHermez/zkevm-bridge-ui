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
import { useBridgeContext } from "src/contexts/bridge.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import {
  AsyncTask,
  isAsyncTaskDataAvailable,
  isEthersInsufficientFundsError,
} from "src/utils/types";
import { getChainName } from "src/utils/labels";
import { formatTokenAmount } from "src/utils/amounts";
import { getChainTokens } from "src/constants";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import { getChainCustomTokens, addCustomToken, removeCustomToken } from "src/adapters/storage";
import { Chain, Token, TokenWithBalance, FormData } from "src/domain";

interface BridgeFormProps {
  account: string;
  formData?: FormData;
  resetForm: () => void;
  onSubmit: (formData: FormData) => void;
}

interface Chains {
  from: Chain;
  to: Chain;
}

const BridgeForm: FC<BridgeFormProps> = ({ account, formData, resetForm, onSubmit }) => {
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeFormStyles();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const {
    estimateBridgeGasPrice,
    getErc20TokenBalance,
    computeWrappedTokenAddress,
    getNativeTokenInfo,
    getTokenFromAddress,
  } = useBridgeContext();
  const { connectedProvider } = useProvidersContext();
  const [balanceTo, setBalanceTo] = useState<BigNumber>();
  const [inputError, setInputError] = useState<string>();
  const [chains, setChains] = useState<Chains>();
  const [token, setToken] = useState<Token>();
  const [amount, setAmount] = useState<BigNumber>();
  const [estimatedFee, setEstimatedFee] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });
  const [chainList, setChainList] = useState<Chain[]>();
  const [tokenList, setTokenList] = useState<TokenWithBalance[]>();
  const [tokens, setTokens] = useState<TokenWithBalance[]>();
  const [tokenListSearchInputValue, setTokenListSearchInputValue] = useState<string>("");
  const [tokenListCustomToken, setTokenListCustomToken] = useState<
    AsyncTask<TokenWithBalance, string>
  >({
    status: "pending",
  });

  const getTokens = (chain: Chain) => {
    return [...getChainCustomTokens(chain), ...getChainTokens(chain)];
  };

  const getTokenFilterByTerm = (term: string) => (token: TokenWithBalance) =>
    term.length === 0 ||
    token.address.toLowerCase().includes(term.toLowerCase()) ||
    token.name.toLowerCase().includes(term.toLowerCase()) ||
    token.symbol.toLowerCase().includes(term.toLowerCase());

  const getEtherToken = (chain: Chain): Token | undefined => {
    return getTokens(chain).find((token) => token.address === ethersConstants.AddressZero);
  };

  const onAmountInputChange = ({ amount, error }: { amount?: BigNumber; error?: string }) => {
    setAmount(amount);
    setInputError(error);
  };

  const onChainButtonClick = (from: Chain) => {
    if (env) {
      const to = env.chains.find((chain) => chain.key !== from.key);

      if (to) {
        setChains({ from, to });
        setToken(getEtherToken(from));
        setChainList(undefined);
        setAmount(undefined);
      }
    }
  };

  const onTokenDropdownClick = () => {
    setTokenList(tokens);
  };

  const onTokenListTokenSelected = (token: TokenWithBalance) => {
    setToken(token);
    setTokenList(undefined);
    setAmount(undefined);
  };

  const updateTokenList = (tokensWithBalance: TokenWithBalance[], tokenListSearchTerm: string) => {
    const filteredTokens = tokensWithBalance.filter(getTokenFilterByTerm(tokenListSearchTerm));
    setTokenList(filteredTokens);
    setTokenListCustomToken({ status: "pending" });
    if (chains && ethersUtils.isAddress(tokenListSearchTerm) && filteredTokens.length === 0) {
      setTokenListCustomToken({ status: "loading" });
      void getTokenFromAddress({
        address: tokenListSearchTerm,
        chain: chains.from,
      })
        .then((token) => {
          getTokenBalance(token, chains.from)
            .then((balance) => {
              callIfMounted(() => {
                const tokenWithBalance: TokenWithBalance = { ...token, balance };
                setTokenList([tokenWithBalance]);
                callIfMounted(() => {
                  setTokenListCustomToken({ status: "successful", data: tokenWithBalance });
                });
              });
            })
            .catch(() => {
              callIfMounted(() => {
                const tokenWithBalance: TokenWithBalance = { ...token, balance: undefined };
                setTokenList([tokenWithBalance]);
              });
            });
        })
        .catch(() =>
          callIfMounted(() => {
            setTokenListCustomToken({
              status: "failed",
              error: `The token can not be imported: A problem occurred calling the provided contract on the ${getChainName(
                chains.from
              )} chain with id ${chains.from.chainId}`,
            });
          })
        );
    }
  };

  const onTokenListClosed = () => {
    setTokenList(undefined);
    setTokenListCustomToken({ status: "pending" });
    setTokenListSearchInputValue("");
  };

  const onTokenListImportToken = (tokenWithBalance: TokenWithBalance) => {
    if (tokens) {
      const { name, symbol, address, decimals, chainId, logoURI } = tokenWithBalance;
      addCustomToken({ name, symbol, address, decimals, chainId, logoURI });
      const newTokensWithBalance = [tokenWithBalance, ...tokens];
      setTokens(newTokensWithBalance);
      updateTokenList(newTokensWithBalance, tokenListSearchInputValue);
    }
  };

  const onTokenListRemoveToken = (token: TokenWithBalance) => {
    if (tokens) {
      removeCustomToken(token);
      const newTokensWithBalance = tokens.filter((tkn) => tkn.address !== token.address);
      setTokens(newTokensWithBalance);
      updateTokenList(newTokensWithBalance, tokenListSearchInputValue);
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
    if (chains && token && amount && estimatedFee.status === "successful") {
      onSubmit({
        token: token,
        from: chains.from,
        to: chains.to,
        amount: amount,
        estimatedFee: estimatedFee.data,
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
          tokenAddress: token.address,
          accountAddress: account,
        });
      }
    },
    [account, getErc20TokenBalance]
  );

  useEffect(() => {
    /*
     *  Load the balances of the tokens
     */
    if (chains) {
      const tokens = getTokens(chains.from);
      void Promise.all(
        tokens.map(
          (token: Token): Promise<TokenWithBalance> =>
            getTokenBalance(token, chains.from)
              .then((balance) => ({ ...token, balance }))
              .catch(() => ({ ...token, balance: undefined }))
        )
      ).then((tokensWithBalance) => {
        callIfMounted(() => {
          setTokens(tokensWithBalance);
        });
      });
    }
  }, [chains, callIfMounted, getTokenBalance]);

  useEffect(() => {
    /*
     *  Get the token balance of the secondary network (To)
     */
    if (chains && token) {
      const isTokenEther = token.address === ethersConstants.AddressZero;
      if (isTokenEther) {
        void chains.to.provider
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
        // We first assume that we have a wrapped Token selected in From and look for its
        // native version, which will correspond to the token of the chain selected in To
        void getNativeTokenInfo({
          token: token,
          chain: chains.from,
        })
          .then((tokenInfo) => tokenInfo.originalTokenAddress)
          .catch(() =>
            // Since we could not find a native version of the token selected in From, we know the token
            // is already native to From and can safely compute the address of the wrapped token in To
            computeWrappedTokenAddress({
              token,
              nativeChain: chains.from,
              otherChain: chains.to,
            })
          )
          .then((toTokenAddress) =>
            getErc20TokenBalance({
              chain: chains.to,
              tokenAddress: toTokenAddress,
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
              )
          );
      }
    }
  }, [
    chains,
    account,
    token,
    getErc20TokenBalance,
    notifyError,
    computeWrappedTokenAddress,
    getNativeTokenInfo,
    callIfMounted,
  ]);

  useEffect(() => {
    /*
     * Load the default values after the network is changed
     */
    if (env && connectedProvider && formData === undefined) {
      const from = env.chains.find((chain) => chain.chainId === connectedProvider.chainId);
      const to = env.chains.find((chain) => chain.chainId !== connectedProvider.chainId);
      if (from && to) {
        setChains({ from, to });
        setToken(getEtherToken(from));
      }
      setAmount(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedProvider, env]);

  useEffect(() => {
    /*
     *  Restore the previous values of the form after closing the confirmation window
     */
    if (formData) {
      setChains({ from: formData.from, to: formData.to });
      setToken(formData.token);
      setAmount(formData.amount);
      resetForm();
    }
  }, [formData, resetForm]);

  useEffect(() => {
    /*
     * Get gas price estimates
     */
    if (chains && token) {
      estimateBridgeGasPrice({
        from: chains.from,
        to: chains.to,
        token,
        destinationAddress: account,
      })
        .then((estimatedFee) => {
          callIfMounted(() => {
            setEstimatedFee({ status: "successful", data: estimatedFee });
          });
        })
        .catch((error) => {
          if (isEthersInsufficientFundsError(error)) {
            callIfMounted(() => {
              setEstimatedFee({
                status: "failed",
                error: `You don't have enough ETH to pay for the fees`,
              });
            });
          } else {
            callIfMounted(() => {
              notifyError(error);
            });
          }
        });
    }
  }, [account, chains, token, estimateBridgeGasPrice, notifyError, callIfMounted]);

  if (!env || !chains || !token) {
    return null;
  }

  const fromBalance = tokens?.find((tkn) => tkn.address === token.address)?.balance;

  const tokenListSearchError =
    tokenListCustomToken.status === "failed"
      ? tokenListCustomToken.error
      : tokenListSearchInputValue.length > 0 && tokenList && tokenList.length === 0
      ? `The input "${tokenListSearchInputValue}" produced no matches`
      : undefined;

  return (
    <form className={classes.form} onSubmit={onFormSubmit}>
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.box}>
            <Typography type="body2">From</Typography>
            <button
              className={`${classes.chainSelector} ${classes.chainSelectorButton}`}
              onClick={() => setChainList(env.chains)}
              type="button"
            >
              <chains.from.Icon />
              <Typography type="body1">{getChainName(chains.from)}</Typography>
              <CaretDown />
            </button>
          </div>
          <div className={`${classes.box} ${classes.alignRight}`}>
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
            fee={isAsyncTaskDataAvailable(estimatedFee) ? estimatedFee.data : undefined}
            onChange={onAmountInputChange}
          />
        </div>
      </Card>
      <div className={classes.arrowRow}>
        <div className={classes.arrowDownIcon}>
          <ArrowDown />
        </div>
      </div>
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.box}>
            <Typography type="body2">To</Typography>
            <div className={classes.chainSelector}>
              <chains.to.Icon />
              <Typography type="body1">{getChainName(chains.to)}</Typography>
            </div>
          </div>
          <div className={`${classes.box} ${classes.alignRight}`}>
            <Typography type="body2">Balance</Typography>
            <Typography type="body1">
              {`${balanceTo ? formatTokenAmount(balanceTo, token) : "--"} ${token.symbol}`}
            </Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <Button
          type="submit"
          disabled={
            !amount ||
            amount.isZero() ||
            inputError !== undefined ||
            estimatedFee.status === "failed"
          }
        >
          Continue
        </Button>
        {amount && inputError && estimatedFee.status !== "failed" && <Error error={inputError} />}
        {estimatedFee.status === "failed" && <Error error={estimatedFee.error} />}
      </div>
      {chainList && (
        <ChainList
          chains={chainList}
          selected={chains.from}
          onClick={onChainButtonClick}
          onClose={() => setChainList(undefined)}
        />
      )}
      {tokenList && (
        <TokenList
          chain={chains.from}
          customToken={tokenListCustomToken}
          error={tokenListSearchError}
          searchInputValue={tokenListSearchInputValue}
          selected={token}
          tokens={tokenList}
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
