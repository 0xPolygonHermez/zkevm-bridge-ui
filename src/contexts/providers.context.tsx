import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { useNavigate } from "react-router-dom";

import { Chain, EthereumEvent, WalletName } from "src/domain";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { ethereumAccountsParser, getConnectedAccounts } from "src/adapters/ethereum";
import { parseError } from "src/adapters/error";
import { useEnvContext } from "src/contexts/env.context";
import { useUIContext } from "src/contexts/ui.context";
import routes from "src/routes";

interface ProvidersContext {
  connectedProvider?: Web3Provider;
  l1Provider?: JsonRpcProvider;
  l2Provider?: JsonRpcProvider;
  account: AsyncTask<string, string>;
  connectProvider: (walletName: WalletName) => Promise<void>;
  disconnectProvider: () => Promise<void>;
  getBalance: (chainId: Chain["chainId"]) => Promise<BigNumber>;
}

const providersContextNotReadyErrorMsg = "The providers context is not yet ready";

const providersContext = createContext<ProvidersContext>({
  account: { status: "pending" },
  connectProvider: () => {
    return Promise.reject(new Error(providersContextNotReadyErrorMsg));
  },
  disconnectProvider: () => {
    return Promise.reject(new Error(providersContextNotReadyErrorMsg));
  },
  getBalance: () => Promise.resolve(BigNumber.from(0)),
});

const ProvidersProvider: FC = (props) => {
  const navigate = useNavigate();
  const [connectedProvider, setConnectedProvider] = useState<Web3Provider>();
  const [l1Provider, setL1Provider] = useState<JsonRpcProvider>();
  const [l2Provider, setL2Provider] = useState<JsonRpcProvider>();
  const [account, setAccount] = useState<AsyncTask<string, string>>({ status: "pending" });
  const env = useEnvContext();
  const { openSnackbar } = useUIContext();

  const connectProvider = useCallback(
    async (walletName: WalletName): Promise<void> => {
      setAccount({ status: "loading" });
      switch (walletName) {
        case WalletName.METAMASK: {
          if (window.ethereum && window.ethereum.isMetaMask) {
            const web3Provider = new Web3Provider(window.ethereum);
            return getConnectedAccounts(web3Provider)
              .then((accounts) => {
                setConnectedProvider(web3Provider);
                setAccount({ status: "successful", data: accounts[0] });
              })
              .catch((error) =>
                parseError(error).then((errorMsg) => {
                  if (isMetamaskUserRejectedRequestError(error)) {
                    setAccount({ status: "pending" });
                  } else {
                    openSnackbar({
                      type: "error",
                      parsed: errorMsg,
                    });
                  }
                })
              );
          } else {
            return setAccount({
              status: "failed",
              error: `We cannot detect your wallet. Make sure the ${WalletName.METAMASK} extension is installed and active in your browser.`,
            });
          }
        }
        case WalletName.WALLET_CONNECT: {
          if (env) {
            const walletConnectProvider = new WalletConnectProvider({
              rpc: {
                [env.l1Node.chainId]: env.l1Node.rpcUrl,
              },
            });
            const web3Provider = new Web3Provider(walletConnectProvider);

            return walletConnectProvider
              .enable()
              .then((accounts) => {
                setConnectedProvider(web3Provider);
                setAccount({ status: "successful", data: accounts[0] });
              })
              .catch((error) =>
                parseError(error).then((errorMsg) => {
                  if (error instanceof Error && error.message === "User closed modal") {
                    setAccount({ status: "pending" });
                  } else {
                    openSnackbar({
                      type: "error",
                      parsed: errorMsg,
                    });
                  }
                })
              );
          } else
            return setAccount({
              status: "failed",
              error: "The env has not been initialized correctly.",
            });
        }
      }
    },
    [env, openSnackbar]
  );

  const disconnectProvider = useCallback((): Promise<void> => {
    if (
      connectedProvider?.provider &&
      connectedProvider.provider instanceof WalletConnectProvider
    ) {
      return connectedProvider.provider.disconnect().then(() => {
        setConnectedProvider(undefined);
        setAccount({ status: "pending" });
      });
    } else {
      return new Promise((resolve) => {
        setConnectedProvider(undefined);
        setAccount({ status: "pending" });
        resolve();
      });
    }
  }, [connectedProvider]);

  const getBalance = useCallback(
    async (chainId: Chain["chainId"]) => {
      try {
        if (account.status === "successful" && l1Provider && l2Provider) {
          const promises = [l1Provider, l2Provider].map(async (provider) => {
            const { chainId } = await provider.getNetwork();
            return { chainId, provider };
          });
          const providers = await Promise.all(promises);
          const providerRequested = providers.find((provider) => provider.chainId === chainId);
          if (providerRequested) {
            return await providerRequested.provider.getBalance(account.data);
          }
        }
      } catch (error) {
        void parseError(error).then((errorMsg) => {
          openSnackbar({
            type: "error",
            parsed: errorMsg,
          });
        });
      }
      return BigNumber.from(0);
    },
    [account, l1Provider, l2Provider, openSnackbar]
  );

  useEffect(() => {
    const internalConnectedProvider: Record<string, unknown> | undefined =
      connectedProvider?.provider;
    const onAccountsChanged = (accounts: unknown): void => {
      const parsedAccounts = ethereumAccountsParser.safeParse(accounts);

      if (parsedAccounts.success) {
        if (parsedAccounts.data.length) {
          setAccount({ status: "successful", data: parsedAccounts.data[0] });
        } else {
          setAccount({ status: "pending" });
          navigate(routes.login.path);
        }
      }
    };
    const onChainChangedOrDisconnect = () => {
      window.location.reload();
    };

    if (
      internalConnectedProvider &&
      "on" in internalConnectedProvider &&
      typeof internalConnectedProvider.on === "function"
    ) {
      internalConnectedProvider.on(EthereumEvent.ACCOUNTS_CHANGED, onAccountsChanged);
      internalConnectedProvider.on(EthereumEvent.CHAIN_CHANGED, onChainChangedOrDisconnect);
      internalConnectedProvider.on(EthereumEvent.DISCONNECT, onChainChangedOrDisconnect);
    }

    return () => {
      if (
        internalConnectedProvider &&
        "removeListener" in internalConnectedProvider &&
        typeof internalConnectedProvider.removeListener === "function"
      ) {
        internalConnectedProvider.removeListener(EthereumEvent.ACCOUNTS_CHANGED, onAccountsChanged);
        internalConnectedProvider.removeListener(
          EthereumEvent.CHAIN_CHANGED,
          onChainChangedOrDisconnect
        );
        internalConnectedProvider.removeListener(
          EthereumEvent.DISCONNECT,
          onChainChangedOrDisconnect
        );
      }
    };
  }, [connectedProvider, navigate]);

  useEffect(() => {
    if (env) {
      setL1Provider(new JsonRpcProvider(env.l1Node.rpcUrl));
      setL2Provider(new JsonRpcProvider(env.l2Node.rpcUrl));
    }
  }, [env]);

  const value = useMemo(
    () => ({
      connectedProvider,
      account,
      l1Provider,
      l2Provider,
      connectProvider,
      disconnectProvider,
      getBalance,
    }),
    [
      account,
      connectProvider,
      connectedProvider,
      disconnectProvider,
      getBalance,
      l1Provider,
      l2Provider,
    ]
  );

  return <providersContext.Provider value={value} {...props} />;
};

const useProvidersContext = (): ProvidersContext => {
  return useContext(providersContext);
};

export { ProvidersProvider, useProvidersContext };
