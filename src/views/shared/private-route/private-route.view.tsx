import { FC } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useEthereumProviderContext } from "src/contexts/ethereum-provider.context";
import routes from "src/routes";

const PrivateRoute: FC = ({ children }) => {
  const { provider } = useEthereumProviderContext();
  const { pathname } = useLocation();

  if (!provider) {
    return <Navigate to={routes.login.path} state={{ redirectUrl: pathname }} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
