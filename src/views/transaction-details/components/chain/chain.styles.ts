import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

const useChainStyles = createUseStyles((theme: Theme) => ({
  hermezChain: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export default useChainStyles;
