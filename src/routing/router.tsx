import { Routes, Route } from "react-router-dom";

import Home from "src/views/home/home.view";

function Router(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default Router;
