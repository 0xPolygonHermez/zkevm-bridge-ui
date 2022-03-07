import { Route, Routes } from "react-router-dom";

import useAppStyles from "src/views/app.styles";
import Home from "src/views/home/home.view";
import Login from "src/views/login/login.view";

const App = (): JSX.Element => {
  useAppStyles();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
