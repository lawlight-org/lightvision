// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LightVisionProvider } from "./contexts/LightVisionContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.GOOGLE_OAUTH_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <GoogleOAuthProvider clientId={clientId}>
    <LightVisionProvider>
      <App />
    </LightVisionProvider>
  </GoogleOAuthProvider>,
  // </StrictMode>
);
