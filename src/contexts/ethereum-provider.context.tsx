import { createContext, FC, useContext, useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { useNavigate } from "react-router-dom";

import { EthereumEvent, WalletName } from "src/domain";
import { AsyncTask } from "src/utils/types";
import { ethereumAccountsParser } from "src/adapters/parsers";
import { getConnectedAccounts } from "src/adapters/ethereum";
import { useEnvContext } from "./env.context";
import routes from "src/routes";

interface EthereumProviderContextData {
  provider?: Web3Provider;
  account: AsyncTask<string, string>;
  connectProvider?: (walletName: WalletName) => Promise<void>;
  disconnectProvider?: () => Promise<void>;
}

const EthereumProviderContext = createContext<EthereumProviderContextData>({
  provider: undefined,
  account: { status: "pending" },
});

const EthereumProviderProvider: FC = (props) => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Web3Provider>();
  const [account, setAccount] = useState<AsyncTask<string, string>>({ status: "pending" });
  const env = useEnvContext();

  const connectProvider = async (walletName: WalletName): Promise<void> => {
    switch (walletName) {
      case WalletName.METAMASK: {
        if (window.ethereum) {
          const web3Provider = new Web3Provider(window.ethereum);

          return getConnectedAccounts(web3Provider)
            .then((accounts) => {
              setProvider(web3Provider);
              setAccount({ status: "successful", data: accounts[0] });
            })
            .catch(() => setAccount({ status: "failed", error: "Error loading account" }));
        } else {
          return setAccount({
            status: "failed",
            error: "There is no Ethereum provider injected in the window",
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
              setProvider(web3Provider);
              setAccount({ status: "successful", data: accounts[0] });
            })
            .catch(() => {
              setAccount({ status: "failed", error: "Error loading account" });
            });
        } else
          return setAccount({
            status: "failed",
            error: "The env hasn't be initialized properly",
          });
      }
    }
  };

  const disconnectProvider = (): Promise<void> => {
    if (provider?.provider && provider.provider instanceof WalletConnectProvider) {
      return provider.provider.disconnect().then(() => setProvider(undefined));
    } else {
      return new Promise((resolve) => {
        setProvider(undefined);
        resolve();
      });
    }
  };

  useEffect(() => {
    const internalProvider: Record<string, unknown> | undefined = provider?.provider;
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

    if (internalProvider && "on" in internalProvider && typeof internalProvider.on === "function") {
      internalProvider.on(EthereumEvent.ACCOUNTS_CHANGED, onAccountsChanged);
      internalProvider.on(EthereumEvent.CHAIN_CHANGED, onChainChangedOrDisconnect);
      internalProvider.on(EthereumEvent.DISCONNECT, onChainChangedOrDisconnect);
    }

    return () => {
      if (
        internalProvider &&
        "removeListener" in internalProvider &&
        typeof internalProvider.removeListener === "function"
      ) {
        internalProvider.removeListener(EthereumEvent.ACCOUNTS_CHANGED, onAccountsChanged);
        internalProvider.removeListener(EthereumEvent.CHAIN_CHANGED, onChainChangedOrDisconnect);
        internalProvider.removeListener(EthereumEvent.DISCONNECT, onChainChangedOrDisconnect);
      }
    };
  }, [provider, navigate]);

  return (
    <EthereumProviderContext.Provider
      value={{ provider, account, connectProvider, disconnectProvider }}
      {...props}
    />
  );
};

const useEthereumProviderContext = (): EthereumProviderContextData => {
  return useContext(EthereumProviderContext);
};

export { EthereumProviderProvider, useEthereumProviderContext };
