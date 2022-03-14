import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useActivityStyles = createUseStyles((theme: Theme) => ({
  subtitle: {
    marginTop: theme.spacing(-2),
    textAlign: "center",
  },
  card: {
    marginTop: theme.spacing(5),
  },
  currenciesRow: {
    padding: theme.spacing(2),
    [theme.breakpoints.upSm]: {
      padding: theme.spacing(3),
    },
  },
  row: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  conversionIcon: {
    marginRight: theme.spacing(1),
  },
  currencies: {
    marginTop: theme.spacing(2),
    display: "flex",
    width: "100%",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    [theme.breakpoints.upSm]: {
      width: "80%",
    },
  },
  currencyBox: {
    width: theme.spacing(15),
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.grey.light,
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.white}`,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
  currencySelected: {
    borderColor: theme.palette.black,
  },
  currencyText: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  logout: {
    padding: [0, theme.spacing(3), theme.spacing(3)],
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
  },
  logoutText: {
    borderTop: `1px solid ${theme.palette.grey.light}`,
    paddingTop: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  radioInput: {
    position: "absolute",
    opacity: 0,
  },
}));

export default useActivityStyles;
