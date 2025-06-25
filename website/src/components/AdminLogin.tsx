import { useLightVision } from "../hooks/useLightVision";

export const AdminLogin = () => {
  const { makeEditable, setEditing, login } = useLightVision();

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
