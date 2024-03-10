import { Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { hexValue } from "ethers/lib/utils";
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  ethereumAccountsParser,
  getConnectedAccounts,
  silentlyGetConnectedAccounts,
} from "src/adapters/ethereum";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { AsyncTask, Chain, ConnectedProvider, Env, EthereumEvent, WalletName } from "src/domain";
import { getChecksumAddress } from "src/utils/addresses";
import {
  isAsyncTaskDataAvailable,
  isMetaMaskResourceUnavailableError,
  isMetaMaskUnknownChainError,
  isMetaMaskUserRejectedRequestError,
} from "src/utils/types";

interface ProvidersContext {
  addNetwork: (chain: Chain) => Promise<void>;
  changeNetwork: (chain: Chain) => Promise<void>;
  connectProvider: (walletName: WalletName) => Promise<void>;
  connectedProvider: AsyncTask<ConnectedProvider, string>;
}

const providersContextNotReadyErrorMsg = "The providers context is not yet ready";

const providersContext = createContext<ProvidersContext>({
  addNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  changeNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  connectedProvider: { status: "pending" },
  connectProvider: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
});

const ProvidersProvider: FC<PropsWithChildren> = (props) => {
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const [connectedProvider, setConnectedProvider] = useState<AsyncTask<ConnectedProvider, string>>({
    status: "pending",
  });
  // This is a hack to workaround this MetaMask issue:
  // https://github.com/MetaMask/metamask-extension/issues/13375
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const IS_SWITCHING_NETWORK_DELAY = 1000;

  const getMetamaskProvider = () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      return new Web3Provider(window.ethereum, "any");
    }
  };

  interface ConnectMetamaskProviderParams {
    account: string;
    env: Env;
    web3Provider: Web3Provider;
  }

  const connectMetamaskProvider = useCallback(
    async ({ account, env, web3Provider }: ConnectMetamaskProviderParams): Promise<void> => {
      try {
        const checkMetamaskHeartbeat = setTimeout(() => {
          setConnectedProvider({
            error: `It seems that ${WalletName.METAMASK} is not responding to our requests\nPlease reload the page and try again`,
            status: "failed",
          });
        }, 3000);

        const currentNetwork = await web3Provider.getNetwork();
        clearTimeout(checkMetamaskHeartbeat);

        const currentNetworkChainId = currentNetwork.chainId;
        const supportedChainIds = env.chains.map((chain) => chain.chainId);

        if (!supportedChainIds.includes(currentNetworkChainId)) {
          setConnectedProvider({
            error: `Switch your network to ${env.chains[0].name} or ${env.chains[1].name} to continue`,
            status: "failed",
          });
        } else {
          setConnectedProvider({
            data: {
              account: getChecksumAddress(account),
              chainId: currentNetworkChainId,
              provider: web3Provider,
            },
            status: "successful",
          });
        }
      } catch (error) {
        if (!isMetaMaskUserRejectedRequestError(error)) {
          notifyError(error);
        }
        setConnectedProvider({
          error: "An error occurred connecting the provider",
          status: "failed",
        });
      }
    },
    [notifyError]
  );

  const connectProvider = useCallback(
    async (walletName: WalletName): Promise<void> => {
      if (env === undefined) {
        return setConnectedProvider({
          error: "The env has not been initialized correctly",
          status: "failed",
        });
      }
      switch (walletName) {
        case WalletName.METAMASK: {
          try {
            const web3Provider = getMetamaskProvider();
            if (web3Provider) {
              const accounts = await getConnectedAccounts(web3Provider);
              const account: string | undefined = accounts[0];
              if (account) {
                return connectMetamaskProvider({ account, env, web3Provider });
              } else {
                return setConnectedProvider({
                  error: `We can't obtain any valid Ethereum account`,
                  status: "failed",
                });
              }
            } else {
              return setConnectedProvider({
                error: `We can't detect your wallet.\nPlease make sure that the ${WalletName.METAMASK} extension is installed and active in your browser`,
                status: "failed",
              });
            }
          } catch (error) {
            if (isMetaMaskResourceUnavailableError(error)) {
              return setConnectedProvider({
                error: `Please unlock or connect to ${WalletName.METAMASK} to continue`,
                status: "failed",
              });
            } else if (!isMetaMaskUserRejectedRequestError(error)) {
              notifyError(error);
            }
            return setConnectedProvider({
              status: "pending",
            });
          }
        }
        case WalletName.WALLET_CONNECT: {
          const ethereumChain = env.chains[0];
          const { chainId } = await ethereumChain.provider.getNetwork();
          const walletConnectProvider = new WalletConnectProvider({
            rpc: {
              [chainId]: ethereumChain.provider.connection.url,
            },
          });
          const web3Provider = new Web3Provider(walletConnectProvider);

          return walletConnectProvider
            .enable()
            .then((accounts) => {
              setConnectedProvider({
                data: {
                  account: getChecksumAddress(accounts[0]),
                  chainId,
                  provider: web3Provider,
                },
                status: "successful",
              });
            })
            .catch((error) => {
              if (error instanceof Error && error.message === "User closed modal") {
                setConnectedProvider({ status: "pending" });
              } else {
                notifyError(error);
              }
            });
        }
      }
    },
    [env, connectMetamaskProvider, notifyError]
  );

  const switchNetwork = (chain: Chain, connectedProvider: Web3Provider): Promise<void> => {
    setIsSwitchingNetwork(true);
    if (!connectedProvider.provider.request) {
      return Promise.reject(
        new Error("No request method is available from the provider to switch the Ethereum chain")
      );
    }
    return connectedProvider.provider
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexValue(chain.chainId) }],
      })
      .then(async () => {
        const { chainId } = await connectedProvider.getNetwork();

        if (chainId !== chain.chainId) {
          throw "wrong-network";
        }
      })
      .catch((error) => {
        if (!isMetaMaskResourceUnavailableError(error)) {
          throw error;
        }
      })
      .finally(() => {
        setTimeout(() => {
          setIsSwitchingNetwork(false);
        }, IS_SWITCHING_NETWORK_DELAY);
      });
  };

  const addNetwork = useCallback(
    (chain: Chain): Promise<void> => {
      setIsSwitchingNetwork(true);
      const provider = getMetamaskProvider();
      if (!provider) {
        return Promise.reject(new Error("No provider is available"));
      }
      if (!provider.provider.request) {
        return Promise.reject(
          new Error("No request method is available from the provider to add an Ethereum chain")
        );
      }
      return provider.provider
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              blockExplorerUrls: [chain.explorerUrl],
              chainId: hexValue(chain.chainId),
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.provider.connection.url],
            },
          ],
        })
        .then(async () => {
          if (isAsyncTaskDataAvailable(connectedProvider)) {
            const { chainId } = await connectedProvider.data.provider.getNetwork();

            if (chainId !== chain.chainId) {
              throw "wrong-network";
            }
          }
        })
        .catch((error) => {
          if (!isMetaMaskResourceUnavailableError(error)) {
            throw error;
          }
        })
        .finally(() => {
          setTimeout(() => {
            setIsSwitchingNetwork(false);
          }, IS_SWITCHING_NETWORK_DELAY);
        });
    },
    [connectedProvider]
  );

  const changeNetwork = useCallback(
    (chain: Chain) => {
      if (
        isAsyncTaskDataAvailable(connectedProvider) &&
        connectedProvider.data.provider.provider.isMetaMask
      ) {
        return switchNetwork(chain, connectedProvider.data.provider).catch((error) => {
          if (isMetaMaskUnknownChainError(error)) {
            return addNetwork(chain);
          } else {
            throw error;
          }
        });
      } else {
        return Promise.reject(new Error(providersContextNotReadyErrorMsg));
      }
    },
    [addNetwork, connectedProvider]
  );

  useEffect(() => {
    if (connectedProvider.status === "pending") {
      const web3Provider = getMetamaskProvider();

      if (!web3Provider) {
        setConnectedProvider({
          error: "",
          status: "failed",
        });
      } else if (env) {
        void silentlyGetConnectedAccounts(web3Provider).then((accounts) => {
          const account: string | undefined = accounts[0];
          if (account) {
            void connectMetamaskProvider({ account, env, web3Provider });
          } else {
            setConnectedProvider({
              error: "",
              status: "failed",
            });
          }
        });
      }
    }
  }, [connectMetamaskProvider, connectedProvider.status, env]);

  useEffect(() => {
    const externalProvider: Record<string, unknown> | undefined = isAsyncTaskDataAvailable(
      connectedProvider
    )
      ? connectedProvider.data.provider.provider
      : undefined;
    const onAccountsChanged = (accounts: unknown): void => {
      const parsedAccounts = ethereumAccountsParser.safeParse(accounts);

      if (parsedAccounts.success && isAsyncTaskDataAvailable(connectedProvider)) {
        const account: string | undefined = parsedAccounts.data[0];
        if (account) {
          try {
            setConnectedProvider({
              data: {
                ...connectedProvider.data,
                account: getChecksumAddress(account),
              },
              status: "successful",
            });
          } catch (error) {
            setConnectedProvider({
              error: "An error occurred connecting the provider",
              status: "failed",
            });
            notifyError(error);
          }
        } else {
          setConnectedProvider({ status: "pending" });
        }
      }
    };
    const onChainChanged = () => {
      if (isAsyncTaskDataAvailable(connectedProvider)) {
        if (connectedProvider.data.provider.provider.isMetaMask) {
          void connectProvider(WalletName.METAMASK);
        } else {
          void connectProvider(WalletName.WALLET_CONNECT);
        }
      }
    };

    const onDisconnect = () => {
      if (!isSwitchingNetwork) {
        setConnectedProvider({ status: "pending" });
      }
    };

    if (externalProvider && "on" in externalProvider && typeof externalProvider.on === "function") {
      externalProvider.on(EthereumEvent.ACCOUNTS_CHANGED, onAccountsChanged);
      externalProvider.on(EthereumEvent.CHAIN_CHANGED, onChainChanged);
      externalProvider.on(EthereumEvent.DISCONNECT, onDisconnect);
    }

    return () => {
      if (
        externalProvider &&
        "removeListener" in externalProvider &&
        typeof externalProvider.removeListener === "function"
      ) {
        externalProvider.removeListener(EthereumEvent.ACCOUNTS_CHANGED, onAccountsChanged);
        externalProvider.removeListener(EthereumEvent.CHAIN_CHANGED, onChainChanged);
        externalProvider.removeListener(EthereumEvent.DISCONNECT, onDisconnect);
      }
    };
  }, [connectedProvider, isSwitchingNetwork, connectProvider, navigate, notifyError]);

  const value = useMemo(
    () => ({
      addNetwork,
      changeNetwork,
      connectedProvider,
      connectProvider,
    }),
    [connectedProvider, addNetwork, changeNetwork, connectProvider]
  );

  return <providersContext.Provider value={value} {...props} />;
};

const useProvidersContext = (): ProvidersContext => {
  return useContext(providersContext);
};

export { ProvidersProvider, useProvidersContext };
