import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LightVision } from "../contexts/LightVisionContext";
import { Toaster } from "react-hot-toast";

export const LightVisionProvider = ({ children, clientId }: any) => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LightVision>{children}</LightVision>
      <Toaster />
    </GoogleOAuthProvider>
  );
};

export default LightVisionProvider;
