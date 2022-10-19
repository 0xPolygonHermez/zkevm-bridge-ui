import { FC, PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useProvidersContext } from "src/contexts/providers.context";
import routes from "src/routes";

const PrivateRoute: FC<PropsWithChildren> = ({ children }) => {
  const { connectedProvider } = useProvidersContext();
  const { pathname, search } = useLocation();

  switch (connectedProvider.status) {
    case "pending":
    case "loading": {
      return null;
    }
    case "failed": {
      return (
        <Navigate to={routes.login.path} replace state={{ redirectUrl: `${pathname}${search}` }} />
      );
    }
    case "reloading":
    case "successful": {
      return <>{children}</>;
    }
  }
};

export default PrivateRoute;
