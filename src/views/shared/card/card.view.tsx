import { FC, PropsWithChildren } from "react";

import useCardStyles from "src/views/shared/card/card.styles";

type CardProps = PropsWithChildren<{
  className?: string;
  onClick?: () => void;
}>;

const Card: FC<CardProps> = ({ className, children, onClick }) => {
  const classes = useCardStyles();

  return (
    <div className={`${classes.card} ${className || ""}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
