import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useExternalLinkStyles = createUseStyles((theme: Theme) => ({
  link: {
    "&:hover": {
      color: theme.palette.primary.dark,
    },
    color: theme.palette.primary.main,
    transition: theme.hoverTransition,
  },
}));
