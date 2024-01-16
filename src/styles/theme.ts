export const theme = {
  breakpoints: {
    upSm: "@media (min-width: 480px)",
  },
  hoverTransition: "all 150ms",
  maxWidth: 644,
  palette: {
    black: "#F9F9F9",
    error: {
      light: "rgba(232,67,12,0.1)",
      main: "#FD7B5B",
    },
    grey: {
      dark: "rgba(249,249,249,0.6)",
      light: "#16161A",
      main: "rgba(81,103,161,0.2)",
      veryDark: "#363740",
    },
    primary: {
      dark: "#90D7FF",
      main: "#1D92FF",
    },
    success: {
      light: "rgba(0,255,0,0.1)",
      main: "#64C572",
    },
    transparency: "rgba(22,22,26,0.5)",
    warning: {
      light: "rgba(225,126,38,0.1)",
      main: "#e17e26",
    },
    white: "#232429",
  },
  spacing: (value: number): number => value * 8,
};

export type Theme = typeof theme;