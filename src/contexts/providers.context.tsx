import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { useNavigate } from "react-router-dom";

import { EthereumEvent, WalletName } from "src/domain";
import {
  AsyncTask,
  isMetamaskUnknownChainError,
  isMetamaskUserRejectedRequestError,
} from "src/utils/types";
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
  changeNetwork: (chainId: string) => Promise<void>;
  connectProvider: (walletName: WalletName) => Promise<void>;
  disconnectProvider: () => Promise<void>;
}

const providersContextNotReadyErrorMsg = "The providers context is not yet ready";

const providersContext = createContext<ProvidersContext>({
  account: { status: "pending" },
  changeNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  connectProvider: () => {
    return Promise.reject(new Error(providersContextNotReadyErrorMsg));
  },
  disconnectProvider: () => {
    return Promise.reject(new Error(providersContextNotReadyErrorMsg));
  },
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

  const changeNetwork = useCallback(
    async (chainId: string) => {
      if (window.ethereum && window.ethereum.request) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
          });
        } catch (switchError) {
          void parseError(switchError).then(async (errorMsg) => {
            if (isMetamaskUnknownChainError(switchError)) {
              try {
                if (env && window.ethereum && window.ethereum.request) {
                  await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                      {
                        chainId: chainId,
                        chainName: "Polygon Hermez",
                        rpcUrls: [env.l2Node.rpcUrl],
                      },
                    ],
                  });
                }
              } catch (addError) {
                void parseError(addError).then((errorMsg) => {
                  openSnackbar({
                    type: "error",
                    parsed: errorMsg,
                  });
                });
              }
            } else {
              openSnackbar({
                type: "error",
                parsed: errorMsg,
              });
            }
          });
        }
      }
    },
    [env, openSnackbar]
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
      if (connectedProvider?.connection.url === "eip-1193:") {
        void connectProvider(WalletName.WALLET_CONNECT);
      } else {
        void connectProvider(WalletName.METAMASK);
      }
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
  }, [connectProvider, connectedProvider, navigate]);

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
      changeNetwork,
      connectProvider,
      disconnectProvider,
    }),
    [
      account,
      changeNetwork,
      connectProvider,
      connectedProvider,
      disconnectProvider,
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
