import { FC } from "react";

import useCardStyles from "src/views/shared/card/card.styles";

interface CardProps {
  className?: string;
}

const Card: FC<CardProps> = ({ className, children }) => {
  const classes = useCardStyles();

  return <div className={`${classes.card} ${className || ""}`}>{children}</div>;
};

export default Card;
