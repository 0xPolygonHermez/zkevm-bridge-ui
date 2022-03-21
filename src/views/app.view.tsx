import { GlobalProvider } from "src/contexts/global.context";
import { EnvProvider } from "src/contexts/env.context";
import { EthereumProviderProvider } from "src/contexts/ethereum-provider.context";
import Layout from "src/views/core/layout/layout.view";
import Router from "src/views/core/router/router.view";
import useAppStyles from "src/views/app.styles";

const App = (): JSX.Element => {
  useAppStyles();

  return (
    <GlobalProvider>
      <EnvProvider>
        <EthereumProviderProvider>
          <Layout>
            <Router />
          </Layout>
        </EthereumProviderProvider>
      </EnvProvider>
    </GlobalProvider>
  );
};

export default App;
