import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";
import Settings from "src/views/settings/settings.view";
import Activity from "src/views/activity/activity.view";
import BridgeDetails from "src/views/bridge-details/bridge-details.view";
import BridgeConfirmation from "src/views/bridge-confirmation/bridge-confirmation.view";
import UnderMaintenance from "src/views/under-maintenance/under-maintenance.view";

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
  bridgeDetails: {
    path: "/bridge-details/:bridgeId",
    Component: BridgeDetails,
    isPrivate: true,
  },
  bridgeConfirmation: {
    path: "/bridge-confirmation",
    Component: BridgeConfirmation,
    isPrivate: true,
  },
  underMaintenance: {
    path: "/under-maintenance",
    Component: UnderMaintenance,
    isPrivate: false,
  },
};

export default routes;
