import { Route, Routes } from "react-router-dom";

import useAppStyles from "src/views/app.styles";
import Layout from "src/views/core/layout/layout.view";
import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";
import Activity from "src/views/activity/activity.view";
import Settings from "src/views/settings/settings.view";

const App = (): JSX.Element => {
  useAppStyles();
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
};

export default App;
