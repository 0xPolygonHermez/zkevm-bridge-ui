import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";
import Activity from "./views/activity/activity.view";
import Settings from "./views/settings/settings.view";

const routes = {
  home: {
    path: "/",
    Component: Home,
    isPrivate: true,
  },
  login: {
    path: "/login",
    Component: Login,
    isPrivate: false,
  },
  settings: {
    path: "/settings",
    Component: Settings,
    isPrivate: true,
  },
  activity: {
    path: "/activity",
    Component: Activity,
    isPrivate: true,
  },
};

export default routes;
