import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Always dark brand: clear any old theme preference
document.documentElement.classList.remove("light");
document.documentElement.style.colorScheme = "dark";
try {
  localStorage.removeItem("audit-theme");
} catch {
  /* ignore */
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
