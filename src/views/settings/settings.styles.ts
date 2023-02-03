import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useSettingsStyles = createUseStyles((theme: Theme) => ({
  card: {
    margin: [theme.spacing(5), "auto", 0, "auto"],
    maxWidth: theme.maxWidth,
  },
  contentWrapper: {
    padding: [0, theme.spacing(2)],
  },
  conversionIcon: {
    marginRight: theme.spacing(1),
  },
  currencies: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: "100%",
    [theme.breakpoints.upSm]: {
      width: "80%",
    },
  },
  currenciesRow: {
    padding: theme.spacing(2),
    [theme.breakpoints.upSm]: {
      padding: theme.spacing(3),
    },
  },
  currencyBox: {
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
    alignItems: "center",
    backgroundColor: theme.palette.grey.light,
    border: `1px solid ${theme.palette.white}`,
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    padding: theme.spacing(1.5),
    width: theme.spacing(15),
  },
  currencySelected: {
    borderColor: theme.palette.black,
  },
  currencyText: {
    flex: 1,
    marginLeft: theme.spacing(1),
  },
  radioInput: {
    cursor: "pointer",
    opacity: 0,
    position: "absolute",
  },
  row: {
    alignItems: "center",
    display: "flex",
    marginBottom: theme.spacing(2),
  },
}));
