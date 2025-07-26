// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
const clientId = import.meta.env.VITE_APP_GOOGLE_OAUTH_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
  <LightVisionProvider clientId={clientId}>
    <App />
  </LightVisionProvider>,
);
