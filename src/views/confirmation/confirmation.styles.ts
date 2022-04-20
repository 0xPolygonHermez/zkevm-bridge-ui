import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useConfirmationStyles = createUseStyles((theme: Theme) => ({
  card: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1),
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(3), 0],
      padding: theme.spacing(3),
    },
  },
  icon: {
    marginTop: theme.spacing(1),
    [theme.breakpoints.upSm]: {
      marginBottom: theme.spacing(2),
    },
  },
  chainsRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.upSm]: {
      flexDirection: "row",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(4),
    },
  },
  chainBox: {
    display: "flex",
    gap: theme.spacing(1),
    width: 239,
    backgroundColor: theme.palette.grey.light,
    justifyContent: "center",
    padding: theme.spacing(1.25),
    borderRadius: 56,
  },
  arrow: {
    transform: `rotate(90deg)`,
    [theme.breakpoints.upSm]: {
      transform: "none",
    },
  },
  fees: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.grey.light}`,
    gap: theme.spacing(1),
  },
  fee: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  betweenFees: {
    marginTop: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(2),
    [theme.breakpoints.upSm]: {
      margin: theme.spacing(6),
    },
  },
}));

export default useConfirmationStyles;
