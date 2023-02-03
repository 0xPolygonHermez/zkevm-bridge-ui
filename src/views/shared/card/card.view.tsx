import { FC, PropsWithChildren } from "react";

import { useCardStyles } from "src/views/shared/card/card.styles";

type CardProps = PropsWithChildren<{
  className?: string;
  onClick?: () => void;
}>;

export const Card: FC<CardProps> = ({ children, className, onClick }) => {
  const classes = useCardStyles();

  return (
    <div className={`${classes.card} ${className || ""}`} onClick={onClick}>
      {children}
    </div>
  );
};
