import { BridgeProvider } from "src/contexts/bridge.context";
import { EnvProvider } from "src/contexts/env.context";
import { ErrorProvider } from "src/contexts/error.context";
import { FormProvider } from "src/contexts/form.context";
import { ProvidersProvider } from "src/contexts/providers.context";
import { TokensProvider } from "src/contexts/tokens.context";
import { UIProvider } from "src/contexts/ui.context";
import { useAppStyles } from "src/views/app.styles";
import { Layout } from "src/views/core/layout/layout.view";
import { Router } from "src/views/core/router/router.view";

export const App = (): JSX.Element => {
  useAppStyles();

  return (
    <UIProvider>
      <ErrorProvider>
        <EnvProvider>
          <ProvidersProvider>
            <TokensProvider>
              <BridgeProvider>
                <FormProvider>
                  <Layout>
                    <Router />
                  </Layout>
                </FormProvider>
              </BridgeProvider>
            </TokensProvider>
          </ProvidersProvider>
        </EnvProvider>
      </ErrorProvider>
    </UIProvider>
  );
};
