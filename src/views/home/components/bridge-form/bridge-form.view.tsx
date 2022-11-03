import { FC, useEffect, useState, useCallback } from "react";
import { BigNumber, constants as ethersConstants } from "ethers";

import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import useBridgeFormStyles from "src/views/home/components/bridge-form/bridge-form.styles";
import ChainList from "src/views/shared/chain-list/chain-list.view";
import AmountInput from "src/views/home/components/amount-input/amount-input.view";
import Typography from "src/views/shared/typography/typography.view";
import Card from "src/views/shared/card/card.view";
import ErrorMessage from "src/views/shared/error-message/error-message.view";
import Icon from "src/views/shared/icon/icon.view";
import Button from "src/views/shared/button/button.view";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { AsyncTask, isAsyncTaskDataAvailable } from "src/utils/types";
import { selectTokenAddress } from "src/utils/tokens";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import { getChainCustomTokens, addCustomToken, removeCustomToken } from "src/adapters/storage";
import { Chain, Token, FormData } from "src/domain";
import { getEtherToken } from "src/constants";
import Spinner from "src/views/shared/spinner/spinner.view";
import TokenSelector from "src/views/home/components/token-selector/token-selector.view";
import TokenBalance from "src/views/shared/token-balance/token-balance.view";

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
  const classes = useBridgeFormStyles();
  const callIfMounted = useCallIfMounted();
  const env = useEnvContext();
  const { getErc20TokenBalance, tokens: defaultTokens } = useTokensContext();
  const { connectedProvider } = useProvidersContext();
  const [balanceFrom, setBalanceFrom] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });
  const [balanceTo, setBalanceTo] = useState<AsyncTask<BigNumber, string>>({ status: "pending" });
  const [inputError, setInputError] = useState<string>();
  const [selectedChains, setSelectedChains] = useState<SelectedChains>();
  const [token, setToken] = useState<Token>();
  const [amount, setAmount] = useState<BigNumber>();
  const [chains, setChains] = useState<Chain[]>();
  const [tokens, setTokens] = useState<Token[]>();
  const [isTokenListOpen, setIsTokenListOpen] = useState(false);

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
    setIsTokenListOpen(true);
  };

  const onSelectToken = (token: Token) => {
    setToken(token);
    setIsTokenListOpen(false);
    setAmount(undefined);
  };

  const onCloseTokenSelector = () => {
    setIsTokenListOpen(false);
  };

  const onAddToken = (token: Token) => {
    if (tokens) {
      // We don't want to store the balance of the user in the local storage
      const { name, symbol, address, decimals, chainId, logoURI, wrappedToken } = token;

      addCustomToken({ name, symbol, address, decimals, chainId, logoURI, wrappedToken });
      setTokens([token, ...tokens]);
    }
  };

  const onRemoveToken = (tokenToRemove: Token) => {
    if (tokens) {
      removeCustomToken(tokenToRemove);
      setTokens(tokens.filter((token) => token.address !== tokenToRemove.address));
      if (selectedChains && tokenToRemove.address === token?.address) {
        setToken(getEtherToken(selectedChains.from));
      }
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
    // Load all the tokens for the selected chain without their balance
    if (selectedChains && defaultTokens) {
      const { from } = selectedChains;
      const chainTokens = [...getChainCustomTokens(from), ...defaultTokens];

      setTokens(
        chainTokens.map((token) => ({
          ...token,
          balance: {
            status: "pending",
          },
        }))
      );
    }
  }, [defaultTokens, selectedChains]);

  useEffect(() => {
    // Load the balances of all the tokens of the primary chain (from)
    const areTokensPending = tokens?.some((tkn) => tkn.balance?.status === "pending");

    if (selectedChains && tokens && areTokensPending) {
      const getUpdatedTokens = (tokens: Token[] | undefined, updatedToken: Token) =>
        tokens
          ? tokens.map((tkn) => (tkn.address === updatedToken.address ? updatedToken : tkn))
          : undefined;

      setTokens(() =>
        tokens.map((token: Token) => {
          getTokenBalance(token, selectedChains.from)
            .then((balance): void => {
              callIfMounted(() => {
                const updatedToken: Token = {
                  ...token,
                  balance: {
                    status: "successful",
                    data: balance,
                  },
                };

                setTokens((currentTokens) => getUpdatedTokens(currentTokens, updatedToken));
              });
            })
            .catch(() => {
              callIfMounted(() => {
                const updatedToken: Token = {
                  ...token,
                  balance: {
                    status: "failed",
                    error: "Couldn't retrieve token balance",
                  },
                };

                setTokens((currentTokens) => getUpdatedTokens(currentTokens, updatedToken));
              });
            });

          return { ...token, balance: { status: "loading" } };
        })
      );
    }
  }, [callIfMounted, defaultTokens, getTokenBalance, selectedChains, tokens]);

  useEffect(() => {
    // Load the balance of the selected token in both networks
    if (selectedChains && token) {
      setBalanceFrom({ status: "loading" });
      setBalanceTo({ status: "loading" });

      getTokenBalance(token, selectedChains.from)
        .then((balance) =>
          callIfMounted(() => {
            setBalanceFrom({ status: "successful", data: balance });
          })
        )
        .catch(() => {
          callIfMounted(() => {
            setBalanceFrom({ status: "failed", error: "Couldn't retrieve token balance" });
          });
        });
      getTokenBalance(token, selectedChains.to)
        .then((balance) =>
          callIfMounted(() => {
            setBalanceTo({ status: "successful", data: balance });
          })
        )
        .catch(() => {
          callIfMounted(() => {
            setBalanceTo({ status: "failed", error: "Couldn't retrieve token balance" });
          });
        });
    }
  }, [callIfMounted, getTokenBalance, selectedChains, token]);

  useEffect(() => {
    // Load the default values after the network is changed
    if (env && connectedProvider.status === "successful" && formData === undefined) {
      const from = env.chains.find((chain) => chain.chainId === connectedProvider.data.chainId);
      const to = env.chains.find((chain) => chain.chainId !== connectedProvider.data.chainId);

      if (from && to) {
        setSelectedChains({ from, to });
        setToken(getEtherToken(from));
      }
      setAmount(undefined);
    }
    // This prevents the form from being reset when coming back from BridgeConfirmation
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
  console.log(tokens);
  if (!env || !selectedChains || !tokens || !token || !maxEtherBridge) {
    return (
      <div className={classes.spinner}>
        <Spinner />
      </div>
    );
  }

  return (
    <form className={classes.form} onSubmit={onFormSubmit}>
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.leftBox}>
            <Typography type="body2">From</Typography>
            <button
              className={classes.fromChain}
              onClick={() => setChains(env.chains)}
              type="button"
            >
              <selectedChains.from.Icon />
              <Typography type="body1">{selectedChains.from.name}</Typography>
              <CaretDown />
            </button>
          </div>
          <div className={classes.rightBox}>
            <Typography type="body2">Balance</Typography>
            <TokenBalance
              token={{ ...token, balance: balanceFrom }}
              spinnerSize={14}
              typographyProps={{ type: "body1" }}
            />
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
            balance={
              balanceFrom && isAsyncTaskDataAvailable(balanceFrom)
                ? balanceFrom.data
                : BigNumber.from(0)
            }
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
            <div className={classes.toChain}>
              <selectedChains.to.Icon />
              <Typography type="body1">{selectedChains.to.name}</Typography>
            </div>
          </div>
          <div className={classes.rightBox}>
            <Typography type="body2">Balance</Typography>
            <TokenBalance
              token={{ ...token, balance: balanceTo }}
              spinnerSize={14}
              typographyProps={{ type: "body1" }}
            />
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <Button type="submit" disabled={!amount || amount.isZero() || inputError !== undefined}>
          Continue
        </Button>
        {amount && inputError && <ErrorMessage error={inputError} />}
      </div>
      {chains && (
        <ChainList
          chains={chains}
          onClick={onChainButtonClick}
          onClose={() => setChains(undefined)}
        />
      )}
      {isTokenListOpen && (
        <TokenSelector
          account={account}
          chains={selectedChains}
          tokens={tokens}
          onClose={onCloseTokenSelector}
          onAddToken={onAddToken}
          onRemoveToken={onRemoveToken}
          onSelectToken={onSelectToken}
        />
      )}
    </form>
  );
};

export default BridgeForm;
