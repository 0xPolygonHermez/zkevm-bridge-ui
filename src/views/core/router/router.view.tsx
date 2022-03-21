import { FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import routes from "src/routes";
import PrivateRoute from "src/views/shared/private-route/private-route.view";

const Router: FC = () => {
  return (
    <Routes>
      {Object.values(routes).map(({ path, Component, isPrivate }) => (
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
