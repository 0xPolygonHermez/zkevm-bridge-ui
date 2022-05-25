import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";
import Settings from "src/views/settings/settings.view";
import Activity from "src/views/activity/activity.view";
import BridgeDetails from "src/views/bridge-details/bridge-details.view";
import BridgeConfirmation from "src/views/bridge-confirmation/bridge-confirmation.view";

const routes = {
  home: {
    path: "/",
    Component: Home,
    isPrivate: true,
  },
  login: {
    path: "/login" as const,
    Component: Login,
    isPrivate: false,
  },
  settings: {
    path: "/settings" as const,
    Component: Settings,
    isPrivate: true,
  },
  activity: {
    path: "/activity" as const,
    Component: Activity,
    isPrivate: true,
  },
  bridgeDetails: {
    path: "/bridge-details/:bridgeId" as const,
    Component: BridgeDetails,
    isPrivate: true,
  },
  bridgeConfirmation: {
    path: "/bridge-confirmation" as const,
    Component: BridgeConfirmation,
    isPrivate: true,
  },
};

export default routes;
