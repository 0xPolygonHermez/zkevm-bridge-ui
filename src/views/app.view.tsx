import { Route, Routes } from "react-router-dom";

import useAppStyles from "src/views/app.styles";
import Layout from "src/views/core/layout/layout.view";
import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";
import { EthereumProviderProvider } from "src/contexts/ethereum-provider.context";

const App = (): JSX.Element => {
  useAppStyles();
  return (
    <Layout>
      <EthereumProviderProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </EthereumProviderProvider>
    </Layout>
  );
};

export default App;
