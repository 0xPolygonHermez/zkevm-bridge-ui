import usePageLoaderStyles from "src/views/shared/page-loader/page-loader.styles";
import Spinner from "src/views/shared/spinner/spinner.view";

function PageLoader(): JSX.Element {
  const classes = usePageLoaderStyles();

  return (
    <div className={classes.root}>
      <Spinner />
    </div>
  );
}

export default PageLoader;
