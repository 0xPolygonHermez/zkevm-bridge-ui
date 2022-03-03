import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export interface ContainerStyles {
  background?: boolean;
}

const useContainerStyles = createUseStyles((theme: Theme) => ({
  root: {
    width: "100%",
    justifyContent: "center",
    display: "flex",
    backgroundColor: ({ background }: ContainerStyles) =>
      background ? theme.palette.white : theme.palette.primary.main,
  },
  wrapper: {
    width: "100%",
    maxWidth: 700 + 2 * theme.spacing(3.5),
    padding: `0px ${theme.spacing(3.5)}px`,
  },
}));

export default useContainerStyles;
