import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";

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
};

export default routes;
