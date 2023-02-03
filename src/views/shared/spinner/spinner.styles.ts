import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

interface StyleProps {
  color?: string;
  size: number;
}

export const useSpinnerStyles = createUseStyles((theme: Theme) => ({
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
  bottomCircle: ({ color = theme.palette.grey.dark }: StyleProps) => ({
    stroke: color,
    strokeOpacity: 0.2,
  }),
  root: ({ size }: StyleProps) => ({
    height: size,
    overflow: "hidden",
    width: size,
  }),
  svg: {
    animation: "$spin 0.8s linear infinite",
  },
  topCircle: ({ color = theme.palette.grey.dark }: StyleProps) => ({
    stroke: color,
    strokeDasharray: "30px 200px",
    strokeDashoffset: "0px",
    strokeLinecap: "round",
  }),
}));
