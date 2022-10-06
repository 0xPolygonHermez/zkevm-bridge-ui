import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useNetworkBoxStyles = createUseStyles((theme: Theme) => ({
  networkBox: {
    background: theme.palette.white,
    borderRadius: 8,
    margin: "auto",
    maxWidth: theme.maxWidth,
    padding: theme.spacing(2),
  },
  metaMaskButton: {
    borderRadius: 8,
    display: "flex",
    appearance: "none",
    margin: "auto",
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
}));

export default useNetworkBoxStyles;
