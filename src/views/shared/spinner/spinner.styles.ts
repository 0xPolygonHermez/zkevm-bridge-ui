import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

interface StyleProps {
  size: number;
  color?: string;
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
  topCircle: ({ color = theme.palette.primary.main }: StyleProps) => ({
    stroke: color,
    strokeLinecap: "round",
    strokeDasharray: "30px 200px",
    strokeDashoffset: "0px",
  }),
  bottomCircle: ({ color = theme.palette.primary.main }: StyleProps) => ({
    bottomCircle: {
      stroke: color,
      strokeOpacity: 0.2,
    },
  }),
}));

export default useSpinnerStyles;
