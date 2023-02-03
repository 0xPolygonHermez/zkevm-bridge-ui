import { ComponentType, FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useEnvContext } from "src/contexts/env.context";
import { RouteId, routes } from "src/routes";
import { areSettingsVisible } from "src/utils/feature-toggles";
import { Activity } from "src/views/activity/activity.view";
import { BridgeConfirmation } from "src/views/bridge-confirmation/bridge-confirmation.view";
import { BridgeDetails } from "src/views/bridge-details/bridge-details.view";
import { Home } from "src/views/home/home.view";
import { Login } from "src/views/login/login.view";
import { NetworkError } from "src/views/network-error/network-error.view";
import { Settings } from "src/views/settings/settings.view";
import { PrivateRoute } from "src/views/shared/private-route/private-route.view";

const components: Record<RouteId, ComponentType> = {
  activity: Activity,
  bridgeConfirmation: BridgeConfirmation,
  bridgeDetails: BridgeDetails,
  home: Home,
  login: Login,
  networkError: NetworkError,
  settings: Settings,
};

export const Router: FC = () => {
  const env = useEnvContext();

  const filteredRoutes =
    !env || areSettingsVisible(env)
      ? routes
      : Object.values(routes).filter((route) => route.path !== routes.settings.path);

  return (
    <Routes>
      {Object.values(filteredRoutes).map(({ id, isPrivate, path }) => {
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
