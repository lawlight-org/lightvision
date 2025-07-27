import React from "react";
import { useLightVision } from "../hooks/useLightVision";

export const AdminLogin = () => {
  const { login } = useLightVision();

  return (
    <button
      onClick={() => {
        login();
      }}
    >
      Admin Login
    </button>
  );
};

export default AdminLogin;
