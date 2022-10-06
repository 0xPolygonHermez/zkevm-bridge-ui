import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useInfoBannerStyles = createUseStyles((theme: Theme) => ({
  infoBanner: {
    width: "100%",
    color: theme.palette.black,
    background: theme.palette.grey.main,
    borderRadius: "8px",
    display: "flex",
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    maxWidth: theme.maxWidth,
  },
}));

export default useInfoBannerStyles;
