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
    warning: {
      main: "#e17e26",
      light: "rgba(225,126,38,0.1)",
    },
    error: {
      main: "#e8430d",
      light: "rgba(232,67,12,0.1)",
    },
    success: "#1ccc8d",
    disabled: "#78798d",
    transparency: "rgba(8,17,50,0.5)",
  },
  hoverTransition: "all 100ms",
  breakpoints: {
    upSm: "@media (min-width: 576px)",
  },
  spacing: (value: number): number => value * 8,
};

export type Theme = typeof theme;

export default theme;
