import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTypographyStyles = createUseStyles((theme: Theme) => ({
  body1: {
    color: theme.palette.black,
    fontSize: 16,
    fontWeight: 500,
    lineHeight: "20px",
    marginBottom: 0,
    marginTop: 0,
  },
  body2: {
    color: theme.palette.grey.dark,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "18px",
    marginBottom: 0,
    marginTop: 0,
  },
  h1: {
    color: theme.palette.black,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: "28px",
    marginBottom: 0,
    marginTop: 0,
  },
  h2: {
    color: theme.palette.black,
    fontSize: 16,
    fontWeight: 500,
    lineHeight: "20px",
    marginBottom: 0,
    marginTop: 0,
    [theme.breakpoints.upSm]: {
      fontSize: 20,
      lineHeight: "24px",
    },
  },
}));
