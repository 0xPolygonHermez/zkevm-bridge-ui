import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useLoginStyles = createUseStyles((theme: Theme) => ({
  contentWrapper: {
    padding: [0, theme.spacing(2)],
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    margin: [theme.spacing(8), "auto", theme.spacing(3), "auto"],
  },
  appName: {
    margin: "0px auto",
    padding: [theme.spacing(1.25), theme.spacing(4)],
    background: theme.palette.grey.main,
    borderRadius: 56,
  },
  cardWrap: {
    margin: [theme.spacing(3), 0],
  },
  card: {
    display: "flex",
    flexDirection: "column",
    margin: [theme.spacing(3), "auto"],
    maxWidth: theme.maxWidth,
  },
  cardHeader: {
    padding: [theme.spacing(3), theme.spacing(4), theme.spacing(2)],
  },
  cardHeaderCentered: {
    textAlign: "center",
  },
  networkInfo: {
    margin: [0, "auto", theme.spacing(2)],
  },
}));

export default useLoginStyles;
