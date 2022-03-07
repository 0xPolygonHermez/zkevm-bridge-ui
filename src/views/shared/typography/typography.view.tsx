import { FC } from "react";

import useTypographyStyles from "src/views/shared/typography/typography.styles";

interface TypographyProps {
  type: "h1" | "h2" | "body1" | "body2";
  className?: string;
}

const Typography: FC<TypographyProps> = ({ type, className, children }) => {
  const classes = useTypographyStyles();
  const Component = type === "body1" || type === "body2" ? "p" : type;

  return <Component className={`${classes[type]} ${className || ""}`}>{children}</Component>;
};

export default Typography;
