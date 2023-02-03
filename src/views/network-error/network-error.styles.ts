import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useNetworkErrorStyles = createUseStyles((theme: Theme) => ({
  button: {
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    backgroundColor: theme.palette.primary.main,
    border: "none",
    borderRadius: 8,
    color: theme.palette.white,
    cursor: "pointer",
    marginTop: theme.spacing(4),
    padding: [theme.spacing(1), theme.spacing(5)],
  },
  logo: {
    marginBottom: theme.spacing(4),
    maxWidth: "300px",
    width: "100%",
  },
  textBox: {
    backgroundColor: theme.palette.white,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    padding: theme.spacing(3),
    textAlign: "center",
  },
  wrapper: {
    alignItems: "center",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: theme.spacing(10),
  },
}));
