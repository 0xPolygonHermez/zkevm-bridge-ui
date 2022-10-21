import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { useNavigate } from "react-router-dom";
import { hexValue } from "ethers/lib/utils";

import {
  AsyncTask,
  isMetaMaskResourceUnavailableError,
  isMetaMaskUnknownChainError,
  isMetaMaskUserRejectedRequestError,
  isAsyncTaskDataAvailable,
} from "src/utils/types";
import {
  ethereumAccountsParser,
  getConnectedAccounts,
  silentlyGetConnectedAccounts,
} from "src/adapters/ethereum";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import {
  Env,
  Chain,
  EthereumChainId,
  EthereumEvent,
  WalletName,
  ConnectedProvider,
} from "src/domain";
import { getChecksumAddress } from "src/utils/addresses";

interface ProvidersContext {
  connectedProvider: AsyncTask<ConnectedProvider, string>;
  addNetwork: (chain: Chain) => Promise<void>;
  changeNetwork: (chain: Chain) => Promise<void>;
  connectProvider: (walletName: WalletName) => Promise<void>;
}

const providersContextNotReadyErrorMsg = "The providers context is not yet ready";

const providersContext = createContext<ProvidersContext>({
  connectedProvider: { status: "pending" },
  addNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  changeNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
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
    env: Env;
    web3Provider: Web3Provider;
    account: string;
  }

  const connectMetamaskProvider = useCallback(
    async ({ env, web3Provider, account }: ConnectMetamaskProviderParams): Promise<void> => {
      try {
        const checkMetamaskHeartbeat = setTimeout(() => {
          setConnectedProvider({
            status: "failed",
            error: `It seems that ${WalletName.METAMASK} is not responding to our requests\nPlease reload the page and try again`,
          });
        }, 3000);

        const currentNetwork = await web3Provider.getNetwork();
        clearTimeout(checkMetamaskHeartbeat);

        const currentNetworkChainId = currentNetwork.chainId;
        const supportedChainIds = env.chains.map((chain) => chain.chainId);
        if (!supportedChainIds.includes(currentNetworkChainId)) {
          setConnectedProvider({
            status: "failed",
            error: supportedChainIds.includes(EthereumChainId.GOERLI)
              ? `Switch your network to Ethereum Goerli testnet or ${env.chains[1].name} to continue`
              : `Switch your network to Ethereum or ${env.chains[1].name} to continue`,
          });
        } else {
          setConnectedProvider({
            status: "successful",
            data: {
              provider: web3Provider,
              chainId: currentNetworkChainId,
              account: getChecksumAddress(account),
            },
          });
        }
      } catch (error) {
        if (!isMetaMaskUserRejectedRequestError(error)) {
          notifyError(error);
        }
        setConnectedProvider({
          status: "failed",
          error: "An error occurred connecting the provider",
        });
      }
    },
    [notifyError]
  );

  const connectProvider = useCallback(
    async (walletName: WalletName): Promise<void> => {
      if (env === undefined) {
        return setConnectedProvider({
          status: "failed",
          error: "The env has not been initialized correctly",
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
                return connectMetamaskProvider({ env, web3Provider, account });
              } else {
                return setConnectedProvider({
                  status: "failed",
                  error: `We can't obtain any valid Ethereum account`,
                });
              }
            } else {
              return setConnectedProvider({
                status: "failed",
                error: `We can't detect your wallet\nPlease make sure that the ${WalletName.METAMASK} extension is installed and active in your browser`,
              });
            }
          } catch (error) {
            if (isMetaMaskResourceUnavailableError(error)) {
              return setConnectedProvider({
                status: "failed",
                error: `Please unlock or connect to ${WalletName.METAMASK} to continue`,
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
                status: "successful",
                data: {
                  provider: web3Provider,
                  chainId,
                  account: getChecksumAddress(accounts[0]),
                },
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
              chainId: hexValue(chain.chainId),
              chainName: chain.name,
              rpcUrls: [chain.provider.connection.url],
              blockExplorerUrls: [chain.explorerUrl],
              nativeCurrency: chain.nativeCurrency,
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
      if (web3Provider && env) {
        void silentlyGetConnectedAccounts(web3Provider).then((accounts) => {
          const account: string | undefined = accounts[0];
          if (account) {
            void connectMetamaskProvider({ env, web3Provider, account });
          } else {
            setConnectedProvider({
              status: "failed",
              error: "",
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
              status: "successful",
              data: {
                ...connectedProvider.data,
                account: getChecksumAddress(account),
              },
            });
          } catch (error) {
            setConnectedProvider({
              status: "failed",
              error: "An error occurred connecting the provider",
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
      connectedProvider,
      addNetwork,
      changeNetwork,
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
