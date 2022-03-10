import { FC } from "react";
import { Navigate } from "react-router-dom";

import { useEthereumProviderContext } from "src/contexts/ethereum-provider.context";
import routes from "src/routes";

const PrivateRoute: FC = ({ children }) => {
  const { provider } = useEthereumProviderContext();

  if (!provider) {
    return <Navigate to={routes.login.path} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
