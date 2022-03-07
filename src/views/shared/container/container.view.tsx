import { FC } from "react";

import useContainerStyles from "src/views/shared/container/container.styles";

interface ContainerProps {
  flexDirection?: "row" | "column";
}

const Container: FC<ContainerProps> = ({ flexDirection = "row", children }): JSX.Element => {
  const classes = useContainerStyles({ flexDirection });

  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>{children}</div>
    </div>
  );
};

export default Container;
