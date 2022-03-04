import useContainerStyles, { ContainerStyles } from "src/views/shared/container/container.styles";

const Container: React.FC<ContainerStyles> = ({ background, children }): JSX.Element => {
  const classes = useContainerStyles({ background });

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>{children}</div>
    </div>
  );
};

export default Container;
