import { useGoogleLogin } from "@react-oauth/google";
import { GET } from "../api/api";
import { useLightVision } from "../hooks/useLightVision";

export const login = () => {
  const { reLogin, setReLogin, makeEditable, handleSave } = useLightVision();

  useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      // save token in localstorage to send it to the api
      localStorage.setItem("goauth_access_token", tokenResponse.access_token);

      // reauth if expired
      if (reLogin) {
        setReLogin(false);
        handleSave();
        return;
      }

      try {
        const res = await GET("auth");

        if (!res.ok) {
          localStorage.removeItem("goauth_access_token");
          return false;
        }

        // make content editable
        makeEditable();

        console.log(tokenResponse);

        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    onError: (error: any) => {
      console.error(error);
      return false;
    },
  });

  return true;
};
