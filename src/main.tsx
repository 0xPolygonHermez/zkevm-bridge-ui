import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "react-jss";
import { BrowserRouter } from "react-router-dom";
import "normalize.css/normalize.css";

import { theme } from "src/styles/theme";
import { App } from "src/views/app.view";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root container doesn't exist");
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
