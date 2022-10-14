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
} from "src/utils/types";
import {
  ethereumAccountsParser,
  getConnectedAccounts,
  silentlyGetConnectedAccounts,
} from "src/adapters/ethereum";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import routes from "src/routes";
import { Env, Chain, EthereumChainId, EthereumEvent, WalletName } from "src/domain";

interface ProvidersContext {
  isProviderConnecting: boolean;
  connectedProvider?: { provider: Web3Provider; chainId: number };
  account: AsyncTask<string, string>;
  addNetwork: (chain: Chain) => Promise<void>;
  changeNetwork: (chain: Chain) => Promise<void>;
  connectProvider: (walletName: WalletName) => Promise<void>;
}

const providersContextNotReadyErrorMsg = "The providers context is not yet ready";

const providersContext = createContext<ProvidersContext>({
  isProviderConnecting: false,
  account: { status: "pending" },
  addNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  changeNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  connectProvider: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
});

const ProvidersProvider: FC<PropsWithChildren> = (props) => {
  const navigate = useNavigate();
  const [connectedProvider, setConnectedProvider] = useState<{
    provider: Web3Provider;
    chainId: number;
  }>();
  const [isProviderConnecting, setIsProviderConnecting] = useState<boolean>(true);
  const [account, setAccount] = useState<AsyncTask<string, string>>({ status: "pending" });
  const env = useEnvContext();
  const { notifyError } = useErrorContext();

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
          setAccount({
            status: "failed",
            error: `It seems that ${WalletName.METAMASK} is not responding to our requests\nPlease reload the page and try again`,
          });
        }, 3000);

        const currentNetwork = await web3Provider.getNetwork();
        clearTimeout(checkMetamaskHeartbeat);

        const currentNetworkChainId = currentNetwork.chainId;
        const supportedChainIds = env.chains.map((chain) => chain.chainId);
        if (!supportedChainIds.includes(currentNetworkChainId)) {
          setAccount({
            status: "failed",
            error: supportedChainIds.includes(EthereumChainId.GOERLI)
              ? `Switch your network to Ethereum Goerli testnet or ${env.chains[1].name} to continue`
              : `Switch your network to Ethereum or ${env.chains[1].name} to continue`,
          });
        } else {
          setConnectedProvider({ provider: web3Provider, chainId: currentNetworkChainId });
          setAccount({ status: "successful", data: account });
        }
        setIsProviderConnecting(false);
      } catch (error) {
        if (!isMetaMaskUserRejectedRequestError(error)) {
          notifyError(error);
        }
        setIsProviderConnecting(false);
      }
    },
    [notifyError]
  );

  const connectProvider = useCallback(
    async (walletName: WalletName): Promise<void> => {
      if (env === undefined) {
        return setAccount({
          status: "failed",
          error: "The env has not been initialized correctly",
        });
      }
      setIsProviderConnecting(true);
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
                return setAccount({
                  status: "failed",
                  error: `We can't obtain any valid Ethereum account`,
                });
              }
            } else {
              return setAccount({
                status: "failed",
                error: `We can't detect your wallet\nPlease make sure that the ${WalletName.METAMASK} extension is installed and active in your browser`,
              });
            }
          } catch (error) {
            if (isMetaMaskResourceUnavailableError(error)) {
              return setAccount({
                status: "failed",
                error: `Please connect to or unlock ${WalletName.METAMASK} to continue`,
              });
            } else if (!isMetaMaskUserRejectedRequestError(error)) {
              notifyError(error);
            }
            setIsProviderConnecting(false);
            return setAccount({ status: "pending" });
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
              setConnectedProvider({ provider: web3Provider, chainId });
              setAccount({ status: "successful", data: accounts[0] });
            })
            .catch((error) => {
              if (error instanceof Error && error.message === "User closed modal") {
                setAccount({ status: "pending" });
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
    if (connectedProvider.provider.request) {
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
        });
    }
    return Promise.reject(new Error("The provider does not have a request method"));
  };

  const addNetwork = useCallback(
    (chain: Chain): Promise<void> => {
      const provider = getMetamaskProvider();
      if (!provider) {
        return Promise.reject(new Error("No provider available"));
      }
      if (!provider.provider.request) {
        return Promise.reject(new Error("The provider does not have a request method"));
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
          if (connectedProvider) {
            const { chainId } = await connectedProvider.provider.getNetwork();

            if (chainId !== chain.chainId) {
              throw "wrong-network";
            }
          }
        })
        .catch((error) => {
          if (!isMetaMaskResourceUnavailableError(error)) {
            throw error;
          }
        });
    },
    [connectedProvider]
  );

  const changeNetwork = useCallback(
    (chain: Chain) => {
      if (connectedProvider && connectedProvider.provider.provider.isMetaMask) {
        return switchNetwork(chain, connectedProvider.provider).catch((error) => {
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
    if (!connectedProvider && account.status !== "failed") {
      setIsProviderConnecting(true);
      const web3Provider = getMetamaskProvider();
      if (web3Provider && env) {
        void silentlyGetConnectedAccounts(web3Provider).then((accounts) => {
          const account: string | undefined = accounts[0];
          if (account) {
            return connectMetamaskProvider({ env, web3Provider, account });
          } else {
            setIsProviderConnecting(false);
          }
        });
      }
    }
  }, [account, connectedProvider, env, connectMetamaskProvider]);

  useEffect(() => {
    if (account.status === "failed") {
      navigate(routes.login.path);
    }
  }, [account, navigate]);

  useEffect(() => {
    const internalConnectedProvider: Record<string, unknown> | undefined =
      connectedProvider?.provider.provider;
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
    const onChainChanged = () => {
      if (connectedProvider) {
        if (connectedProvider.provider.provider.isMetaMask) {
          void connectProvider(WalletName.METAMASK);
        } else {
          void connectProvider(WalletName.WALLET_CONNECT);
        }
      }
    };

    const onDisconnect = () => {
      window.location.reload();
    };

    if (
      internalConnectedProvider &&
      "on" in internalConnectedProvider &&
      typeof internalConnectedProvider.on === "function"
    ) {
      internalConnectedProvider.on(EthereumEvent.ACCOUNTS_CHANGED, onAccountsChanged);
      internalConnectedProvider.on(EthereumEvent.CHAIN_CHANGED, onChainChanged);
      internalConnectedProvider.on(EthereumEvent.DISCONNECT, onDisconnect);
    }

    return () => {
      if (
        internalConnectedProvider &&
        "removeListener" in internalConnectedProvider &&
        typeof internalConnectedProvider.removeListener === "function"
      ) {
        internalConnectedProvider.removeListener(EthereumEvent.ACCOUNTS_CHANGED, onAccountsChanged);
        internalConnectedProvider.removeListener(EthereumEvent.CHAIN_CHANGED, onChainChanged);
        internalConnectedProvider.removeListener(EthereumEvent.DISCONNECT, onDisconnect);
      }
    };
  }, [connectProvider, connectedProvider, navigate]);

  const value = useMemo(
    () => ({
      account,
      isProviderConnecting,
      connectedProvider,
      addNetwork,
      changeNetwork,
      connectProvider,
    }),
    [account, isProviderConnecting, connectedProvider, addNetwork, changeNetwork, connectProvider]
  );

  return <providersContext.Provider value={value} {...props} />;
};

const useProvidersContext = (): ProvidersContext => {
  return useContext(providersContext);
};

export { ProvidersProvider, useProvidersContext };
