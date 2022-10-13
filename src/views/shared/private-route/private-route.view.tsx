import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useEnvContext } from "src/contexts/env.context";

import { useProvidersContext } from "src/contexts/providers.context";
import routes from "src/routes";
import { isAsyncTaskDataAvailable } from "src/utils/types";

const PrivateRoute: FC<PropsWithChildren> = ({ children }) => {
  const env = useEnvContext();
  const {
    connectedProvider,
    account,
    getMetaMaskProvider,
    connectMetaMaskProvider,
    silentlyGetMetaMaskConnectedAccounts,
  } = useProvidersContext();
  const { pathname, search } = useLocation();
  const [nextRoute, setNextRoute] = useState<"currentRoute" | "login">();

  useEffect(() => {
    if (connectedProvider && isAsyncTaskDataAvailable(account)) {
      setNextRoute("currentRoute");
    } else if (!connectedProvider && env) {
      const web3Provider = getMetaMaskProvider();

      if (web3Provider) {
        void silentlyGetMetaMaskConnectedAccounts({ web3Provider }).then((accounts) => {
          const account = accounts ? accounts[0] : undefined;

          if (!account) {
            setNextRoute("login");
          } else {
            return connectMetaMaskProvider({ env, web3Provider, account });
          }
        });
      }
    }
  }, [
    account,
    connectedProvider,
    env,
    connectMetaMaskProvider,
    getMetaMaskProvider,
    silentlyGetMetaMaskConnectedAccounts,
  ]);

  switch (nextRoute) {
    case "currentRoute": {
      return <>{children}</>;
    }
    case "login": {
      return (
        <Navigate to={routes.login.path} replace state={{ redirectUrl: `${pathname}${search}` }} />
      );
    }
    default: {
      return null;
    }
  }
};

export default PrivateRoute;
