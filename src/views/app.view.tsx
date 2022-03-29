import { GlobalProvider } from "src/contexts/global.context";
import { EnvProvider } from "src/contexts/env.context";
import { ProvidersProvider } from "src/contexts/providers.context";
import Layout from "src/views/core/layout/layout.view";
import Router from "src/views/core/router/router.view";
import useAppStyles from "src/views/app.styles";
import { PriceOracleProvider } from "src/contexts/price-oracle.context";
import { BridgeProvider } from "src/contexts/bridge.context";

const App = (): JSX.Element => {
  useAppStyles();

  return (
    <GlobalProvider>
      <EnvProvider>
        <ProvidersProvider>
          <PriceOracleProvider>
            <BridgeProvider>
              <Layout>
                <Router />
              </Layout>
            </BridgeProvider>
          </PriceOracleProvider>
        </ProvidersProvider>
      </EnvProvider>
    </GlobalProvider>
  );
};

export default App;
