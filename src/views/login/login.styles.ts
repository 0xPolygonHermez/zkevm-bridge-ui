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
    color: theme.palette.black,
    background: theme.palette.grey.main,
    borderRadius: "8px",
    display: "flex",
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    margin: [0, "auto", theme.spacing(2)],
    maxWidth: theme.maxWidth,
  },
}));

export default useLoginStyles;
