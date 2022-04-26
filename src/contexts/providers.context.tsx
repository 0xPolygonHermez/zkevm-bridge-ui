import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
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
  l1Provider?: JsonRpcProvider;
  l2Provider?: JsonRpcProvider;
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

            return web3Provider.getNetwork().then((network) => {
              if (env === undefined) {
                throw new Error("Env is not available");
              }

              const supportedChainIds = env.chains.map((chain) => chain.chainId);

              if (!supportedChainIds.includes(network.chainId)) {
                return setAccount({
                  status: "failed",
                  error: "Switch your network to Ethereum or Polygon Hermez to continue",
                });
              }

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
            });
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

  const estimateGasPrice = useCallback(
    ({ chain, gasUnits }: EstimateGasPriceParams): Promise<BigNumber | undefined> => {
      const provider = chain.name === "ethereum" ? l1Provider : l2Provider;

      if (provider === undefined) {
        throw new Error("Provider is not available");
      }

      return provider.getFeeData().then((feeData) => {
        if (feeData.maxFeePerGas !== null) {
          return gasUnits.mul(feeData.maxFeePerGas);
        }

        if (feeData.gasPrice !== null) {
          return gasUnits.mul(feeData.gasPrice);
        }

        return undefined;
      });
    },
    [l1Provider, l2Provider]
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
      estimateGasPrice,
    }),
    [
      connectedProvider,
      account,
      l1Provider,
      l2Provider,
      connectProvider,
      disconnectProvider,
      estimateGasPrice,
    ]
  );

  return <providersContext.Provider value={value} {...props} />;
};

const useProvidersContext = (): ProvidersContext => {
  return useContext(providersContext);
};

export { ProvidersProvider, useProvidersContext };
