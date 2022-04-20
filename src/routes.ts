import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";
import Settings from "src/views/settings/settings.view";
import Activity from "src/views/activity/activity.view";
import TransactionDetails from "src/views/transaction-details/transaction-details.view";
import TransactionConfirmation from "src/views/transaction-confirmation/transaction-confirmation.view";

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
  transactionConfirmation: {
    path: "/transaction-confirmation",
    Component: TransactionConfirmation,
    isPrivate: true,
  },
};

export default routes;
