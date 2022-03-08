const theme = {
  palette: {
    primary: {
      main: "#7b3fe4",
      dark: "#5a1cc3",
    },
    white: "#ffffff",
    black: "#081132",
    grey: {
      light: "#f0f1f6",
      main: "#e2e5ee",
      dark: "#7c7e96",
    },
    orange: { main: "#e17e26", opacity: "rgba(225,126,38,0.1)" },
    red: { main: "#e8430d", opacity: "rgba(232,67,12,0.1)" },
  },
  hoverTransition: "all 100ms",
  fontWeights: {
    medium: "500",
    bold: "700",
  },
  breakpoints: {
    upSm: "@media (min-width: 576px)",
  },
  spacing: (value: number): number => value * 8,
};

export type Theme = typeof theme;

export default theme;
