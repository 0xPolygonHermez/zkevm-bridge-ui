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
  isMetamaskRequestAccountsError,
  isMetamaskUnknownChainError,
  isMetamaskUserRejectedRequestError,
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

interface ConnectMetamaskProviderParams {
  web3Provider: Web3Provider;
  env: Env;
  account: string;
}

interface SilentlyGetMetaMaskConnectedAccountsParams {
  web3Provider: Web3Provider;
}

interface ProvidersContext {
  connectedProvider?: { provider: Web3Provider; chainId: number };
  account: AsyncTask<string, string>;
  changeNetwork: (chain: Chain) => Promise<number>;
  connectProvider: (walletName: WalletName) => Promise<void>;
  connectMetaMaskProvider: (params: ConnectMetamaskProviderParams) => Promise<void>;
  getMetaMaskProvider: () => Web3Provider | undefined;
  silentlyGetMetaMaskConnectedAccounts: (
    params: SilentlyGetMetaMaskConnectedAccountsParams
  ) => Promise<string[] | undefined>;
}

const providersContextNotReadyErrorMsg = "The providers context is not yet ready";

const providersContext = createContext<ProvidersContext>({
  account: { status: "pending" },
  connectProvider: () => {
    return Promise.reject(new Error(providersContextNotReadyErrorMsg));
  },
  connectMetaMaskProvider: () => {
    return Promise.reject(new Error(providersContextNotReadyErrorMsg));
  },
  changeNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  getMetaMaskProvider: () => {
    throw new Error(providersContextNotReadyErrorMsg);
  },
  silentlyGetMetaMaskConnectedAccounts: () => {
    return Promise.reject(new Error(providersContextNotReadyErrorMsg));
  },
});

const ProvidersProvider: FC<PropsWithChildren> = (props) => {
  const navigate = useNavigate();
  const [connectedProvider, setConnectedProvider] = useState<{
    provider: Web3Provider;
    chainId: number;
  }>();
  const [account, setAccount] = useState<AsyncTask<string, string>>({ status: "pending" });
  const env = useEnvContext();
  const { notifyError } = useErrorContext();

  const getMetaMaskProvider = useCallback(() => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      return new Web3Provider(window.ethereum, "any");
    }
  }, []);

  const silentlyGetMetaMaskConnectedAccounts = useCallback(
    ({ web3Provider }: SilentlyGetMetaMaskConnectedAccountsParams) => {
      return silentlyGetConnectedAccounts(web3Provider);
    },
    []
  );

  const connectMetaMaskProvider = useCallback(
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
      } catch (error) {
        if (!isMetamaskUserRejectedRequestError(error)) {
          notifyError(error);
        }
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
      switch (walletName) {
        case WalletName.METAMASK: {
          try {
            const web3Provider = getMetaMaskProvider();

            if (web3Provider) {
              const accounts = await getConnectedAccounts(web3Provider);
              const account: string | undefined = accounts[0];
              if (account) {
                return connectMetaMaskProvider({ env, web3Provider, account });
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
            if (isMetamaskRequestAccountsError(error)) {
              return setAccount({
                status: "failed",
                error: `Please connect to or unlock ${WalletName.METAMASK} to continue`,
              });
            } else if (!isMetamaskUserRejectedRequestError(error)) {
              notifyError(error);
            }
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
    [env, getMetaMaskProvider, connectMetaMaskProvider, notifyError]
  );

  const switchNetwork = (chain: Chain, connectedProvider: Web3Provider): Promise<number> => {
    if (connectedProvider.provider.request) {
      return connectedProvider.provider
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexValue(chain.chainId) }],
        })
        .then(async () => {
          const { chainId } = await connectedProvider.getNetwork();
          return chainId === chain.chainId
            ? chainId
            : Promise.reject(new Error("Could not switch the network"));
        });
    }
    return Promise.reject(new Error("The provider does not have a request method"));
  };

  const addAndSwitchNetwork = (chain: Chain, connectedProvider: Web3Provider): Promise<number> => {
    if (connectedProvider.provider.request) {
      return connectedProvider.provider
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
          const { chainId } = await connectedProvider.getNetwork();
          return chainId === chain.chainId
            ? chainId
            : Promise.reject(new Error("Could not switch the network"));
        });
    }
    return Promise.reject(new Error("The provider does not have a request method"));
  };

  const changeNetwork = useCallback(
    (chain: Chain) => {
      if (connectedProvider && connectedProvider.provider.provider.isMetaMask) {
        return switchNetwork(chain, connectedProvider.provider).catch((error) => {
          if (isMetamaskUnknownChainError(error)) {
            return addAndSwitchNetwork(chain, connectedProvider.provider);
          } else {
            throw error;
          }
        });
      } else {
        return Promise.reject(new Error(providersContextNotReadyErrorMsg));
      }
    },
    [connectedProvider]
  );

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
      connectedProvider,
      account,
      connectProvider,
      connectMetaMaskProvider,
      changeNetwork,
      getMetaMaskProvider,
      silentlyGetMetaMaskConnectedAccounts,
    }),
    [
      account,
      connectedProvider,
      connectProvider,
      connectMetaMaskProvider,
      changeNetwork,
      getMetaMaskProvider,
      silentlyGetMetaMaskConnectedAccounts,
    ]
  );

  return <providersContext.Provider value={value} {...props} />;
};

const useProvidersContext = (): ProvidersContext => {
  return useContext(providersContext);
};

export { ProvidersProvider, useProvidersContext };
