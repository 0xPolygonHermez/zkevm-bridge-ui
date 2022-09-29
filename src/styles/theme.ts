const theme = {
  maxWidth: 644,
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
    success: {
      main: "#1ccc8d",
      light: "rgba(0,255,0,0.1)",
    },
    transparency: "rgba(8,17,50,0.5)",
  },
  hoverTransition: "all 150ms",
  breakpoints: {
    upSm: "@media (min-width: 480px)",
  },
  spacing: (value: number): number => value * 8,
};

export type Theme = typeof theme;

export default theme;
