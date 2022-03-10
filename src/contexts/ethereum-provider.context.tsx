import { createContext, FC, useContext, useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useNavigate } from "react-router-dom";

import { MetaMaskEvent, WalletName } from "src/domain";
import { AsyncTask } from "src/utils/types";
import { ethereumAccountsParser } from "src/adapters/parsers";

interface EthereumProviderContextData {
  provider?: Web3Provider;
  account: AsyncTask<string, string>;
  connectProvider?: (walletName: WalletName) => Promise<void>;
}

const EthereumProviderContext = createContext<EthereumProviderContextData>({
  provider: undefined,
  account: { status: "pending" },
});

const EthereumProviderProvider: FC = (props) => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Web3Provider | undefined>(undefined);
  const [account, setAccount] = useState<AsyncTask<string, string>>({ status: "pending" });

  const connectProvider = async (walletName: WalletName): Promise<void> => {
    switch (walletName) {
      case WalletName.METAMASK: {
        if (window.ethereum) {
          const web3Provider = new Web3Provider(window.ethereum);

          setProvider(web3Provider);

          return web3Provider
            .send("eth_requestAccounts", [])
            .then((accounts) =>
              setAccount({ status: "successful", data: (accounts as string[])[0] })
            )
            .catch(() => setAccount({ status: "failed", error: "Error loading account" }));
        } else {
          return setAccount({
            status: "failed",
            error: "There is no Ethereum provider injected in the window",
          });
        }
      }
      case WalletName.WALLET_CONNECT: {
        const walletConnectProvider = new WalletConnectProvider({
          infuraId: process.env.REACT_APP_INFURA_API_KEY as string,
        });
        const web3Provider = new Web3Provider(walletConnectProvider);

        setProvider(web3Provider);

        return walletConnectProvider
          .enable()
          .then((accounts) => setAccount({ status: "successful", data: accounts[0] }))
          .catch((error) => {
            console.log(error);
            setAccount({ status: "failed", error: "Error loading account" });
          });
      }
    }
  };

  useEffect(() => {
    const onAccountsChanged = (accounts: unknown): void => {
      const parsedAccounts = ethereumAccountsParser.safeParse(accounts);

      if (parsedAccounts.success) {
        if (parsedAccounts.data.length) {
          setAccount({ status: "successful", data: parsedAccounts.data[0] });
        } else {
          setAccount({ status: "pending" });
          navigate("/login");
        }
      }
    };

    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on(MetaMaskEvent.ACCOUNTS_CHANGED, onAccountsChanged);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener(MetaMaskEvent.ACCOUNTS_CHANGED, onAccountsChanged);
      }
    };
  }, [navigate]);

  useEffect(() => {
    const onChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on(MetaMaskEvent.CHAIN_CHANGED, onChainChanged);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener(MetaMaskEvent.CHAIN_CHANGED, onChainChanged);
      }
    };
  }, []);

  return (
    <EthereumProviderContext.Provider value={{ provider, account, connectProvider }} {...props} />
  );
};

const useEthereumProviderContext = (): EthereumProviderContextData => {
  return useContext(EthereumProviderContext);
};

export { EthereumProviderProvider, useEthereumProviderContext };
