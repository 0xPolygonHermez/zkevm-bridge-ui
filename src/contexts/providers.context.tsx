import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { useNavigate } from "react-router-dom";
import { BigNumber } from "ethers";

import { Chain, EthereumEvent, WalletName } from "src/domain";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { ethereumAccountsParser, getConnectedAccounts } from "src/adapters/ethereum";
import { parseError } from "src/adapters/error";
import { useEnvContext } from "src/contexts/env.context";
import { useUIContext } from "src/contexts/ui.context";
import routes from "src/routes";

interface EstimateGasPriceParams {
  chain: Chain;
  gasUnits: BigNumber;
}

interface ProvidersContext {
  connectedProvider?: Web3Provider;
  account: AsyncTask<string, string>;
  connectProvider: (walletName: WalletName) => Promise<void>;
  disconnectProvider: () => Promise<void>;
  estimateGasPrice: (params: EstimateGasPriceParams) => Promise<BigNumber | undefined>;
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
  estimateGasPrice: () => {
    return Promise.reject(new Error(providersContextNotReadyErrorMsg));
  },
});

const ProvidersProvider: FC = (props) => {
  const navigate = useNavigate();
  const [connectedProvider, setConnectedProvider] = useState<Web3Provider>();
  const [account, setAccount] = useState<AsyncTask<string, string>>({ status: "pending" });
  const env = useEnvContext();
  const { openSnackbar } = useUIContext();

  const connectProvider = useCallback(
    async (walletName: WalletName): Promise<void> => {
      setAccount({ status: "loading" });
      switch (walletName) {
        case WalletName.METAMASK: {
          if (env === undefined) {
            return setAccount({
              status: "failed",
              error: "The env has not been initialized correctly",
            });
          }

          try {
            if (window.ethereum && window.ethereum.isMetaMask) {
              const web3Provider = new Web3Provider(window.ethereum);
              const requestedNetwork = await web3Provider.getNetwork();
              const supportedNetworks = await Promise.all(
                env.chains.map((chain) => chain.provider.getNetwork())
              );
              const requestedChainId = requestedNetwork.chainId;
              const supportedChainIds = supportedNetworks.map((network) => network.chainId);

              if (!supportedChainIds.includes(requestedChainId)) {
                return setAccount({
                  status: "failed",
                  error: "Switch your network to Ethereum or Polygon Hermez to continue",
                });
              }

              const accounts = await getConnectedAccounts(web3Provider);

              setConnectedProvider(web3Provider);
              return setAccount({ status: "successful", data: accounts[0] });
            } else {
              return setAccount({
                status: "failed",
                error: `We cannot detect your wallet. Make sure the ${WalletName.METAMASK} extension is installed and active in your browser`,
              });
            }
          } catch (error) {
            const errorMessage = await parseError(error);

            if (!isMetamaskUserRejectedRequestError(error)) {
              openSnackbar({
                type: "error",
                parsed: errorMessage,
              });
            }

            return setAccount({ status: "pending" });
          }
        }
        case WalletName.WALLET_CONNECT: {
          if (env) {
            const ethereumChain = env.chains.find((chain) => chain.key === "ethereum");

            if (ethereumChain) {
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
            } else {
              return setAccount({
                status: "failed",
                error: "The provider has not been found",
              });
            }
          } else
            return setAccount({
              status: "failed",
              error: "The env has not been initialized correctly",
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

  const estimateGasPrice = useCallback(
    ({ chain, gasUnits }: EstimateGasPriceParams): Promise<BigNumber | undefined> => {
      if (chain.provider === undefined) {
        throw new Error("Provider is not available");
      }

      return chain.provider.getFeeData().then((feeData) => {
        if (feeData.maxFeePerGas !== null) {
          return gasUnits.mul(feeData.maxFeePerGas);
        }

        if (feeData.gasPrice !== null) {
          return gasUnits.mul(feeData.gasPrice);
        }

        return undefined;
      });
    },
    []
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

  const value = useMemo(
    () => ({
      connectedProvider,
      account,
      connectProvider,
      disconnectProvider,
      estimateGasPrice,
    }),
    [account, connectedProvider, connectProvider, disconnectProvider, estimateGasPrice]
  );

  return <providersContext.Provider value={value} {...props} />;
};

const useProvidersContext = (): ProvidersContext => {
  return useContext(providersContext);
};

export { ProvidersProvider, useProvidersContext };
