import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import "./index.css";
import App from "./App.jsx";
import ErroNaTela from "./components/ErroNaTela";
import { isApp, iniciarApp } from "./native/nativeApp";

if (isApp) {
  iniciarApp();
} else {
  const updateSW = registerSW({
    onNeedRefresh() {
      updateSW();
    },
    onOfflineReady() {
      console.log("✅ App pronto para uso offline");
    },
    onRegistered(registration) {
      setInterval(() => registration?.update(), 60000);
    },
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ErroNaTela>
        <App />
      </ErroNaTela>
    </BrowserRouter>
  </StrictMode>,
);
