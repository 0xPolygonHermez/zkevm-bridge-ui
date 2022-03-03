import Router from "src/routing/routes";
import useAppStyles from "src/views/app.styles";

const App = (): JSX.Element => {
  useAppStyles();
  return <Router />;
};

export default App;
