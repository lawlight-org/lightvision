import React from "react";
import { useLightVision } from "../hooks/useLightVision";

export const AdminLogin = () => {
  const { makeEditable, login } = useLightVision();

  return (
    <button
      onClick={() => {
        // login();
        makeEditable();
      }}
    >
      Admin Login
    </button>
  );
};

export default AdminLogin;
