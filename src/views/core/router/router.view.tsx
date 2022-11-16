import { FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useEnvContext } from "src/contexts/env.context";
import routes from "src/routes";
import { areSettingsVisible } from "src/utils/feature-toggles";
import PrivateRoute from "src/views/shared/private-route/private-route.view";

const Router: FC = () => {
  const env = useEnvContext();

  const filteredRoutes =
    !env || areSettingsVisible(env)
      ? routes
      : Object.values(routes).filter((route) => route.path !== routes.settings.path);

  return (
    <Routes>
      {Object.values(filteredRoutes).map(({ Component, isPrivate, path }) => (
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
      ))}
      <Route element={<Navigate to={routes.home.path} />} path="*" />
    </Routes>
  );
};

export default Router;
