import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useLoginStyles = createUseStyles((theme: Theme) => ({
  login: {
    padding: [0, theme.spacing(2)],
    display: "flex",
    flexDirection: "column",
  },
  contentWrapper: {
    margin: "auto",
    maxWidth: theme.maxWidth,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    height: 120,
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(3),
  },
  appName: {
    margin: "0px auto",
    padding: [theme.spacing(1.25), theme.spacing(4)],
    background: theme.palette.grey.main,
    borderRadius: 56,
    marginBottom: theme.spacing(5),
  },
  cardWrap: {
    margin: [theme.spacing(3), 0],
    width: "100%",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    margin: [0, "auto", theme.spacing(3)],
  },
  cardHeader: {
    padding: [theme.spacing(3), theme.spacing(4), theme.spacing(2)],
  },
  cardHeaderCentered: {
    textAlign: "center",
  },
}));

export default useLoginStyles;
