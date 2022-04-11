import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useModalStyles = createUseStyles((theme: Theme) => ({
  background: {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 999,
    background: theme.palette.transparency,
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: theme.spacing(20),
  },
}));

export default useModalStyles;
