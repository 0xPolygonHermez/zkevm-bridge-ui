import { UIProvider } from "src/contexts/ui.context";
import { ConfigProvider } from "src/contexts/env.context";
import { ProvidersProvider } from "src/contexts/providers.context";
import Layout from "src/views/core/layout/layout.view";
import Router from "src/views/core/router/router.view";
import useAppStyles from "src/views/app.styles";
import { PriceOracleProvider } from "src/contexts/price-oracle.context";
import { BridgeProvider } from "src/contexts/bridge.context";
import { TransactionProvider } from "src/contexts/transaction.context";

const App = (): JSX.Element => {
  useAppStyles();

  return (
    <UIProvider>
      <ConfigProvider>
        <ProvidersProvider>
          <BridgeProvider>
            <PriceOracleProvider>
              <TransactionProvider>
                <Layout>
                  <Router />
                </Layout>
              </TransactionProvider>
            </PriceOracleProvider>
          </BridgeProvider>
        </ProvidersProvider>
      </ConfigProvider>
    </UIProvider>
  );
};

export default App;
