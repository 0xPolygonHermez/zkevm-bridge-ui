import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useHomeStyles = createUseStyles((theme: Theme) => ({
  chainRow: {
    textAlign: "center",
  },
  chain: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    margin: theme.spacing(3),
    backgroundColor: theme.palette.grey.light,
    padding: [[theme.spacing(1.25), theme.spacing(3)]],
    borderRadius: theme.spacing(7),
    fontWeight: theme.fontWeights.medium,
    "& svg": {
      marginRight: theme.spacing(1),
    },
  },
}));

export default useHomeStyles;
