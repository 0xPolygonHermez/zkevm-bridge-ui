import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useUnderMaintenanceStyles = createUseStyles((theme: Theme) => ({
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    flex: 1,
  },
  logo: {
    width: "100%",
    maxWidth: "300px",
    marginBottom: theme.spacing(4),
  },
  textBox: {
    gap: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    backgroundColor: theme.palette.white,
    padding: theme.spacing(3),
    borderRadius: 8,
  },
  button: {
    border: "none",
    backgroundColor: theme.palette.primary.main,
    padding: [theme.spacing(1), theme.spacing(5)],
    color: theme.palette.white,
    borderRadius: 8,
    marginTop: theme.spacing(4),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

export default useUnderMaintenanceStyles;
