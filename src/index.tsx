import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "react-jss";
import "normalize.css/normalize.css";

import theme from "src/styles/theme";
import App from "src/views/app.view";

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("app-root")
);
