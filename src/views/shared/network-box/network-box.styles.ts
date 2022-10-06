import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useNetworkBoxStyles = createUseStyles((theme: Theme) => ({
  title: {
    display: "flex",
    gap: 24,
    alignItems: "center",
  },
  networkBox: {
    background: theme.palette.white,
    padding: theme.spacing(3),
  },
  metaMaskButton: {
    borderRadius: 8,
    display: "flex",
    appearance: "none",
    padding: 8,
    border: "none",
    background: theme.palette.grey.main,
    cursor: "pointer",
    "&:hover": {
      background: theme.palette.grey.light,
    },
  },
  metaMaskIcon: {
    width: 20,
    marginRight: theme.spacing(1),
  },
  link: { color: theme.palette.primary.dark },
}));

export default useNetworkBoxStyles;
