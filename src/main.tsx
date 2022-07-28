import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "react-jss";
import { BrowserRouter } from "react-router-dom";
import "normalize.css/normalize.css";

import theme from "src/styles/theme";
import App from "src/views/app.view";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
