import Router from "src/routing/router";
import useAppStyles from "src/views/app.styles";

const App = (): JSX.Element => {
  useAppStyles();
  return <Router />;
};

export default App;
