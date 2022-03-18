import { createContext, FC, useContext, useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
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

interface EthereumProviderContext {
  provider?: Web3Provider;
  account: AsyncTask<string, string>;
  connectProvider?: (walletName: WalletName) => Promise<void>;
  disconnectProvider?: () => Promise<void>;
}

const ethereumProviderContext = createContext<EthereumProviderContext>({
  account: { status: "pending" },
});

const EthereumProviderProvider: FC = (props) => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Web3Provider>();
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
              setProvider(web3Provider);
              setAccount({ status: "successful", data: accounts[0] });
            })
            .catch((error) =>
              parseError(error).then((errorMsg) => {
                if (isMetamaskUserRejectedRequestError(error)) {
                  setAccount({ status: "failed", error: errorMsg });
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
              setProvider(web3Provider);
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
            error: "The env hasn't be initialized properly",
          });
      }
    }
  };

  const disconnectProvider = (): Promise<void> => {
    if (provider?.provider && provider.provider instanceof WalletConnectProvider) {
      return provider.provider.disconnect().then(() => {
        setProvider(undefined);
        setAccount({ status: "pending" });
      });
    } else {
      return new Promise((resolve) => {
        setProvider(undefined);
        setAccount({ status: "pending" });
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
    <ethereumProviderContext.Provider
      value={{ provider, account, connectProvider, disconnectProvider }}
      {...props}
    />
  );
};

const useEthereumProviderContext = (): EthereumProviderContext => {
  return useContext(ethereumProviderContext);
};

export { EthereumProviderProvider, useEthereumProviderContext };
