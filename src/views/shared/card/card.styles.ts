import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useCardStyles = createUseStyles((theme: Theme) => ({
  card: {
    background: theme.palette.white,
    borderRadius: 16,
    overflow: "hidden",
  },
}));
