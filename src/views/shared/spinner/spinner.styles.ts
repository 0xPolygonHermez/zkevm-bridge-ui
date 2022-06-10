import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

interface StyleProps {
  size: number;
}

const useSpinnerStyles = createUseStyles((theme: Theme) => ({
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
  root: ({ size }: StyleProps) => ({
    width: size,
    height: size,
    overflow: "hidden",
  }),
  svg: {
    animation: "$spin 0.8s linear infinite",
  },
  topCircle: {
    stroke: theme.palette.primary.main,
    strokeLinecap: "round",
    strokeDasharray: "30px 200px",
    strokeDashoffset: "0px",
  },
  bottomCircle: {
    stroke: theme.palette.primary.main,
    strokeOpacity: 0.2,
  },
}));

export default useSpinnerStyles;
