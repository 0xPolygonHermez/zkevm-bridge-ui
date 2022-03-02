import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useAppStyles = createUseStyles((theme: Theme) => ({
  "@font-face": [
    {
      fontFamily: "Modern Era",
      src: "url('/fonts/modern-era/ModernEra-Regular.woff2') format('woff2')",
      fallbacks: [
        { src: "url('/fonts/modern-era/ModernEra-Regular.woff') format('woff')" },
        { src: "url('/fonts/modern-era/ModernEra-Regular.ttf') format('truetype')" },
      ],
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      fontFamily: "Modern Era",
      src: "url('/fonts/modern-era/ModernEra-Medium.woff2') format('woff2')",
      fallbacks: [
        { src: "url('/fonts/modern-era/ModernEra-Medium.woff') format('woff')" },
        { src: "url('/fonts/modern-era/ModernEra-Medium.ttf') format('truetype')" },
      ],
      fontWeight: 500,
      fontStyle: "normal",
    },
    {
      fontFamily: "Modern Era",
      src: "url('/fonts/modern-era/ModernEra-Bold.woff2') format('woff2')",
      fallbacks: [
        { src: "url('/fonts/modern-era/ModernEra-Bold.woff') format('woff')" },
        { src: "url('/fonts/modern-era/ModernEra-Bold.ttf') format('truetype')" },
      ],
      fontWeight: 700,
      fontStyle: "normal",
    },
    {
      fontFamily: "Modern Era",
      src: "url('/fonts/modern-era/ModernEra-ExtraBold.woff2') format('woff2')",
      fallbacks: [
        { src: "url('/fonts/modern-era/ModernEra-ExtraBold.woff') format('woff')" },
        { src: "url('/fonts/modern-era/ModernEra-ExtraBold.ttf') format('truetype')" },
      ],
      fontWeight: 800,
      fontStyle: "normal",
    },
  ],
  "@global": {
    "*": {
      boxSizing: "border-box",
    },
    body: {
      fontFamily: "Modern Era",
      fontSize: 16,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      color: theme.palette.black.main,
    },
    "#app-root": {
      zIndex: 0,
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flex: 1,
    },
    "#portal-root": {
      zIndex: 1,
    },
    a: {
      textDecoration: "none",
      color: "inherit",
    },
    p: {
      margin: 0,
    },
    h1: {
      margin: 0,
    },
  },
}));

export default useAppStyles;
