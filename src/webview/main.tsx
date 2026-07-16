import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AppProvider } from "./providers/AppProvider";
import { vscodeBridge } from "./services/vscodeBridge";
import "./styles/globals.css";

// 1. Initialize native VS Code API bridge channel
try {
  vscodeBridge.postMessage({ type: "INIT" });
  console.log("[Sasta-Antigravity] VS Code API bridge successfully initialized.");
} catch (err) {
  console.warn("[Sasta-Antigravity] Failed to acquire VS Code API inside browser environment:", err);
}

// 2. Mount React application into DOM tree
const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>,
  );
}
 
