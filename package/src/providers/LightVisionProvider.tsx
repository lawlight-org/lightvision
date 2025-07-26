import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LightVision } from "../contexts/LightVisionContext";

export const LightVisionProvider = ({ children, clientId }: any) => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LightVision>{children}</LightVision>
    </GoogleOAuthProvider>
  );
};

export default LightVisionProvider;
