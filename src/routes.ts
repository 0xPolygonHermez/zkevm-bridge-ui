export type RouteId = keyof typeof routes;

export const routes = {
  activity: {
    id: "activity",
    isPrivate: true,
    path: "/activity",
  },
  bridgeConfirmation: {
    id: "bridgeConfirmation",
    isPrivate: true,
    path: "/bridge-confirmation",
  },
  bridgeDetails: {
    id: "bridgeDetails",
    isPrivate: true,
    path: "/bridge-details/:bridgeId",
  },
  home: {
    id: "home",
    isPrivate: true,
    path: "/",
  },
  login: {
    id: "login",
    isPrivate: false,
    path: "/login",
  },
  networkError: {
    id: "networkError",
    isPrivate: false,
    path: "/network-error",
  },
  settings: {
    id: "settings",
    isPrivate: true,
    path: "/settings",
  },
} as const;
