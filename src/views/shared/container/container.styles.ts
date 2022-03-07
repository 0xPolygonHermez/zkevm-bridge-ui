import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useContainerStyles = createUseStyles((theme: Theme) => ({
  container: {
    width: "100%",
    justifyContent: "center",
    display: "flex",
  },
  wrapper: {
    width: "100%",
    maxWidth: 700 + 2 * theme.spacing(3.5),
    padding: [0, theme.spacing(3.5)],
    display: "flex",
    flexDirection: ({ flexDirection }: { flexDirection: string }) => flexDirection,
  },
}));

export default useContainerStyles;
