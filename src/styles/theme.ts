const theme = {
  palette: {
    primary: {
      main: "#f6f7fa",
      dark: "#e9ecf4",
      hover: "#dee2ed",
    },
    secondary: {
      light: "#a783e6",
      main: "#8248e5",
      dark: "#6d00f1",
      hover: "#7824EB",
    },
    white: "#ffffff",
    black: {
      main: "#081132",
      hover: "#000411",
    },
    grey: {
      veryLight: "#e1e1f1",
      light: "#f3f3f8",
      main: "#888baa",
      dark: "#7a7c89",
      dark05: "rgba(122, 124, 137, 0.5)",
      hover: "rgba(122, 124, 137, 0.2)",
    },
    red: {
      light: "rgba(255, 75, 64, 0.15)",
      main: "#ff4b40",
    },
    orange: {
      light: "rgba(252, 197, 90, 0.15)",
      main: "#ffc55a",
      dark: "#d8853b",
    },
    purple: {
      light: "rgba(130, 72, 229, 0.15)",
      main: "#8248e5",
      dark: "#6d00f1",
    },
    green: "#219653",
  },
  hoverTransition: "all 100ms",
  fontWeights: {
    normal: "400",
    medium: "500",
    bold: "700",
    extraBold: "800",
  },
  breakpoints: {
    upSm: "@media (min-width: 576px)",
  },
  spacing: (value: number): number => value * 8,
  headerHeight: 84,
  sidenavWidth: 295,
};

export type Theme = typeof theme;

export default theme;
