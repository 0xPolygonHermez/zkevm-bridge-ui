import { FC } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useProvidersContext } from "src/contexts/providers.context";
import routes from "src/routes";

const PrivateRoute: FC = ({ children }) => {
  const { connectedProvider: provider } = useProvidersContext();
  const { pathname } = useLocation();

  if (!provider) {
    return <Navigate to={routes.login.path} replace state={{ redirectUrl: pathname }} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
