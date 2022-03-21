import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";
import Settings from "src/views/settings/settings.view";
import Activity from "src/views/activity/activity.view";
import TransactionDetails from "src/views/transaction-details/transaction-details.view";

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
  transactionDetails: {
    path: "/transaction-details/:transactionId",
    Component: TransactionDetails,
    isPrivate: true,
  },
};

export default routes;
