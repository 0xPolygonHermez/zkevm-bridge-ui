import useContainerStyles, { ContainerStyles } from "src/views/shared/container/container.styles";

const Container: React.FC<ContainerStyles> = ({ background, children }): JSX.Element => {
  const classes = useContainerStyles({ background });

  return (
    <section className={classes.root}>
      <div className={classes.wrapper}>{children}</div>
    </section>
  );
};

export default Container;
