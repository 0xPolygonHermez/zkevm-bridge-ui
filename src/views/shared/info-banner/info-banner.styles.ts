import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useInfoBannerStyles = createUseStyles((theme: Theme) => ({
  infoBanner: {
    width: "100%",
    background: theme.palette.grey.main,
    borderRadius: "8px",
    display: "flex",
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    maxWidth: theme.maxWidth,
  },
  message: {
    color: theme.palette.black,
  },
}));

export default useInfoBannerStyles;
