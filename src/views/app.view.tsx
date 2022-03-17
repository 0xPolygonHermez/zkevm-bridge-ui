import useAppStyles from "src/views/app.styles";
import Layout from "src/views/core/layout/layout.view";
import { EthereumProviderProvider } from "src/contexts/ethereum-provider.context";
import { EnvProvider } from "src/contexts/env.context";
import { GlobalProvider } from "src/contexts/global.context";
import Router from "./core/router/router.view";

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
