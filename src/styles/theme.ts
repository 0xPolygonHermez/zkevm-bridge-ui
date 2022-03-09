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
  },
  hoverTransition: "all 100ms",
  breakpoints: {
    upSm: "@media (min-width: 576px)",
  },
  spacing: (value: number): number => value * 8,
};

export type Theme = typeof theme;

export default theme;
