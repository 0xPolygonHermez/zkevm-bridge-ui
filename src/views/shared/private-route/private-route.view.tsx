import { FC, PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useProvidersContext } from "src/contexts/providers.context";
import routes from "src/routes";

const PrivateRoute: FC<PropsWithChildren> = ({ children }) => {
  const { connectedProvider, isProviderConnecting } = useProvidersContext();
  const { pathname, search } = useLocation();

  if (isProviderConnecting) {
    return null;
  } else if (!connectedProvider) {
    return (
      <Navigate to={routes.login.path} replace state={{ redirectUrl: `${pathname}${search}` }} />
    );
  } else {
    return <>{children}</>;
  }
};

export default PrivateRoute;
