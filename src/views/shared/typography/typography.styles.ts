import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useTypographyStyles = createUseStyles((theme: Theme) => ({
  h1: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: "28px",
    color: theme.palette.black,
    marginTop: 0,
    marginBottom: 0,
  },
  h2: {
    fontSize: 20,
    fontWeight: 500,
    lineHeight: "24px",
    color: theme.palette.black,
    marginTop: 0,
    marginBottom: 0,
  },
  body1: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: "20px",
    color: theme.palette.black,
    marginTop: 0,
    marginBottom: 0,
  },
  body2: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "18px",
    color: theme.palette.grey.dark,
    marginTop: 0,
    marginBottom: 0,
  },
}));

export default useTypographyStyles;
