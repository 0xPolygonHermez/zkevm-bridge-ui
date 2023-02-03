import { FC } from "react";
import { usePageLoaderStyles } from "src/views/shared/page-loader/page-loader.styles";
import { Spinner } from "src/views/shared/spinner/spinner.view";

export const PageLoader: FC = () => {
  const classes = usePageLoaderStyles();

  return (
    <div className={classes.root}>
      <Spinner />
    </div>
  );
};
