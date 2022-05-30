import { UIProvider } from "src/contexts/ui.context";
import { ErrorProvider } from "src/contexts/error.context";
import { EnvProvider } from "src/contexts/env.context";
import { ProvidersProvider } from "src/contexts/providers.context";
import Layout from "src/views/core/layout/layout.view";
import Router from "src/views/core/router/router.view";
import useAppStyles from "src/views/app.styles";
import { PriceOracleProvider } from "src/contexts/price-oracle.context";
import { BridgeProvider } from "src/contexts/bridge.context";
import { FormProvider } from "src/contexts/form.context";

const App = (): JSX.Element => {
  useAppStyles();

  return (
    <UIProvider>
      <ErrorProvider>
        <EnvProvider>
          <ProvidersProvider>
            <PriceOracleProvider>
              <BridgeProvider>
                <FormProvider>
                  <Layout>
                    <Router />
                  </Layout>
                </FormProvider>
              </BridgeProvider>
            </PriceOracleProvider>
          </ProvidersProvider>
        </EnvProvider>
      </ErrorProvider>
    </UIProvider>
  );
};

export default App;
