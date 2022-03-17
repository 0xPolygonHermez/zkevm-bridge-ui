import useAppStyles from "src/views/app.styles";
import Layout from "src/views/core/layout/layout.view";
import { EthereumProviderProvider } from "src/contexts/ethereum-provider.context";
import { EnvProvider } from "src/contexts/env.context";
import Router from "src/views/core/router/router.view";

const App = (): JSX.Element => {
  useAppStyles();

  return (
    <EnvProvider>
      <EthereumProviderProvider>
        <Layout>
          <Router />
        </Layout>
      </EthereumProviderProvider>
    </EnvProvider>
  );
};

export default App;
