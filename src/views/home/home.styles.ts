import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useHomeStyles = createUseStyles((theme: Theme) => ({
  ethereumAddress: {
    display: "flex",
    alignItems: "center",
    margin: [theme.spacing(3), "auto", 0],
    backgroundColor: theme.palette.grey.main,
    padding: [theme.spacing(1.25), theme.spacing(3)],
    borderRadius: theme.spacing(7),
  },
  metaMaskIcon: {
    width: 20,
    marginRight: theme.spacing(1),
  },
  cards: {
    margin: [theme.spacing(5), 0],
  },
  button: {
    margin: [theme.spacing(1), "auto"],
  },
}));

export default useHomeStyles;
