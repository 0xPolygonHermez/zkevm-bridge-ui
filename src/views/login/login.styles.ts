import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useLoginStyles = createUseStyles((theme: Theme) => ({
  logo: {
    margin: [theme.spacing(8), "auto", 0, "auto"],
  },
  appName: {
    marginTop: theme.spacing(3),
    margin: "auto",
    padding: [theme.spacing(1.25), theme.spacing(4)],
    background: theme.palette.grey.main,
    borderRadius: theme.spacing(7),
  },
  cardWrap: {
    margin: [theme.spacing(3), 0],
  },
  card: {
    display: "flex",
    flexDirection: "column",
    margin: [theme.spacing(3), 0],
  },
  cardHeader: {
    padding: [theme.spacing(3), theme.spacing(4), theme.spacing(2)],
  },
  walletList: {
    listStyle: "none",
    paddingLeft: 0,
    margin: 0,
  },
  wallet: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: [theme.spacing(3), theme.spacing(4)],
    cursor: "pointer",
    transition: theme.hoverTransition,
    "&:hover": {
      background: "#e2e5ee",
    },
  },
  walletInfo: {
    display: "flex",
    alignItems: "center",
  },
  walletIconContainer: {
    borderRadius: "50%",
    height: theme.spacing(6),
    width: theme.spacing(6),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  metaMaskIconContainer: {
    background: "#fbe6df",
  },
  walletConnectIconContainer: {
    background: "#e2f0ff",
  },
  walletIcon: {
    height: 24,
  },
  walletName: {
    marginBottom: theme.spacing(1),
  },
}));

export default useLoginStyles;
