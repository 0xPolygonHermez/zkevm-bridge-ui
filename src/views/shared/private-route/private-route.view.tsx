import { FC, PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useProvidersContext } from "src/contexts/providers.context";
import routes from "src/routes";

const PrivateRoute: FC<PropsWithChildren> = ({ children }) => {
  const { connectedProvider } = useProvidersContext();
  const { pathname, search } = useLocation();

  if (!connectedProvider) {
    return (
      <Navigate to={routes.login.path} replace state={{ redirectUrl: `${pathname}${search}` }} />
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
