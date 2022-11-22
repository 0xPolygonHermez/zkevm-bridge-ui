import Activity from "src/views/activity/activity.view";
import BridgeConfirmation from "src/views/bridge-confirmation/bridge-confirmation.view";
import BridgeDetails from "src/views/bridge-details/bridge-details.view";
import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";
import NetworkError from "src/views/network-error/network-error.view";
import Settings from "src/views/settings/settings.view";

const routes = {
  activity: {
    Component: Activity,
    isPrivate: true,
    path: "/activity",
  },
  bridgeConfirmation: {
    Component: BridgeConfirmation,
    isPrivate: true,
    path: "/bridge-confirmation",
  },
  bridgeDetails: {
    Component: BridgeDetails,
    isPrivate: true,
    path: "/bridge-details/:bridgeId",
  },
  home: {
    Component: Home,
    isPrivate: true,
    path: "/",
  },
  login: {
    Component: Login,
    isPrivate: false,
    path: "/login",
  },
  networkError: {
    Component: NetworkError,
    isPrivate: false,
    path: "/network-error",
  },
  settings: {
    Component: Settings,
    isPrivate: true,
    path: "/settings",
  },
};

export default routes;
