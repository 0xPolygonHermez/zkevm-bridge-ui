import { createContext, FC, useContext, useEffect, useState } from "react";
import { Web3Provider, InfuraProvider, JsonRpcProvider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { useNavigate } from "react-router-dom";

import { EthereumEvent, WalletName } from "src/domain";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { ethereumAccountsParser } from "src/adapters/parsers";
import { getConnectedAccounts } from "src/adapters/ethereum";
import { parseError } from "src/adapters/error";
import { useEnvContext } from "src/contexts/env.context";
import { useGlobalContext } from "src/contexts/global.context";
import routes from "src/routes";

interface ProvidersContext {
  connectedProvider?: Web3Provider;
  l1Provider?: InfuraProvider;
  l2Provider?: JsonRpcProvider;
  account: AsyncTask<string, string>;
  connectProvider: (walletName: WalletName) => Promise<void>;
  disconnectProvider: () => Promise<void>;
}

const providersContextNotReadyErrorMsg = "The providers context is not yet ready";

const providersContext = createContext<ProvidersContext>({
  account: { status: "pending" },
  connectProvider: () => {
    console.error(providersContextNotReadyErrorMsg);
    return Promise.resolve();
  },
  disconnectProvider: () => {
    console.error(providersContextNotReadyErrorMsg);
    return Promise.resolve();
  },
});

const ProvidersProvider: FC = (props) => {
  const navigate = useNavigate();
  const [connectedProvider, setConnectedProvider] = useState<Web3Provider>();
  const [l1Provider, setL1Provider] = useState<InfuraProvider>();
  const [l2Provider, setL2Provider] = useState<JsonRpcProvider>();
  const [account, setAccount] = useState<AsyncTask<string, string>>({ status: "pending" });
  const env = useEnvContext();
  const { openSnackbar } = useGlobalContext();

  const connectProvider = async (walletName: WalletName): Promise<void> => {
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
            infuraId: env.REACT_APP_INFURA_API_KEY,
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
  };

  const disconnectProvider = (): Promise<void> => {
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
  };

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

    if (env) {
      setL1Provider(
        new InfuraProvider(env.REACT_APP_L1_PROVIDER_NETWORK, env.REACT_APP_INFURA_API_KEY)
      );
      setL2Provider(new JsonRpcProvider(env.REACT_APP_L2_PROVIDER_URL));
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
  }, [connectedProvider, env, navigate]);

  return (
    <providersContext.Provider
      value={{
        connectedProvider,
        account,
        l1Provider,
        l2Provider,
        connectProvider,
        disconnectProvider,
      }}
      {...props}
    />
  );
};

const useProvidersContext = (): ProvidersContext => {
  return useContext(providersContext);
};

export { ProvidersProvider, useProvidersContext };
