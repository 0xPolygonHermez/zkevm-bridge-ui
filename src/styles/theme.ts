const theme = {
  palette: {
    primary: {
      main: "#f6f7fa",
      hover: "#dee2ed",
    },
    white: "#ffffff",
    black: {
      main: "#081132",
    },
    grey: {
      light: "#e2e5ee",
      hover: "rgba(67, 85, 140, 0.1)",
    },
  },
  hoverTransition: "all 100ms",
  fontWeights: {
    medium: "500",
  },
  breakpoints: {
    upSm: "@media (min-width: 576px)",
  },
  spacing: (value: number): number => value * 8,
};

export type Theme = typeof theme;

export default theme;
