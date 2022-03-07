import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useCardStyles = createUseStyles((theme: Theme) => ({
  card: {
    background: theme.palette.white,
    borderRadius: theme.spacing(2),
    overflow: "hidden",
  },
}));

export default useCardStyles;
