import { ComponentType, FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { RouteId, routes } from "src/routes";
import { Activity } from "src/views/activity/activity.view";
import { BridgeConfirmation } from "src/views/bridge-confirmation/bridge-confirmation.view";
import { BridgeDetails } from "src/views/bridge-details/bridge-details.view";
import { Home } from "src/views/home/home.view";
import { Login } from "src/views/login/login.view";
import { NetworkError } from "src/views/network-error/network-error.view";
import { PrivateRoute } from "src/views/shared/private-route/private-route.view";

const components: Record<RouteId, ComponentType> = {
  activity: Activity,
  bridgeConfirmation: BridgeConfirmation,
  bridgeDetails: BridgeDetails,
  home: Home,
  login: Login,
  networkError: NetworkError,
};

export const Router: FC = () => {
  return (
    <Routes>
      {Object.values(routes).map(({ id, isPrivate, path }) => {
        const Component = components[id];
        return (
          <Route
            element={
              isPrivate ? (
                <PrivateRoute>
                  <Component />
                </PrivateRoute>
              ) : (
                <Component />
              )
            }
            key={path}
            path={path}
          />
        );
      })}
      <Route element={<Navigate to={routes.home.path} />} path="*" />
    </Routes>
  );
};
