import { FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import routes from "src/routes";
import { areSettingsVisible } from "src/utils/feature-toggles";
import PrivateRoute from "src/views/shared/private-route/private-route.view";
import { useEnvContext } from "src/contexts/env.context";

const Router: FC = () => {
  const env = useEnvContext();

  const filteredRoutes =
    !env || areSettingsVisible(env)
      ? routes
      : Object.values(routes).filter((route) => route.path !== routes.settings.path);

  return (
    <Routes>
      {Object.values(filteredRoutes).map(({ path, Component, isPrivate }) => (
        <Route
          key={path}
          path={path}
          element={
            isPrivate ? (
              <PrivateRoute>
                <Component />
              </PrivateRoute>
            ) : (
              <Component />
            )
          }
        />
      ))}
      <Route path="*" element={<Navigate to={routes.home.path} />} />
    </Routes>
  );
};

export default Router;
