import { FC, PropsWithChildren } from "react";

import useTypographyStyles from "src/views/shared/typography/typography.styles";

export type TypographyProps = PropsWithChildren<{
  type: "h1" | "h2" | "body1" | "body2";
  className?: string;
}>;

const Typography: FC<TypographyProps> = ({ type, className, children }) => {
  const classes = useTypographyStyles();
  const Component = type === "body1" || type === "body2" ? "p" : type;

  return <Component className={`${classes[type]} ${className || ""}`}>{children}</Component>;
};

export default Typography;
