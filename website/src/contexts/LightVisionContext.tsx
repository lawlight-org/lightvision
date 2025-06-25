import {
  createContext,
  useEffect,
  useState,
  type ChangeEvent,
  type FC,
  type ReactNode,
} from "react";
import type { LightVisionType } from "../types/LightVisionType";
import { useGoogleLogin } from "@react-oauth/google";
import { GET, POST } from "../api/api";

export const LightVision = createContext<LightVisionType>({
  content: {},
  setEditing: () => {},
  login: () => {},
  makeEditable: () => {},
});

export const LightVisionProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [content, setContent] = useState(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [reLogin, setReLogin] = useState<boolean>(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log(e.target.files);
      var data = new FormData();
      data.append("file", e.target.files[0]);

      const res = await POST("upload", data, "form");
      console.log(res);
    }
  };

  const makeEditable = () => {
    setEditing(true);

    const all: HTMLElement[] = Array.from(
      document.body.querySelectorAll<HTMLElement>("*"),
    );
    console.log(all);

    for (const el of all) {
      if (el instanceof HTMLAnchorElement) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
        });
      }

      if (el instanceof HTMLImageElement) {
        el.addEventListener("mouseover", (e) => {
          console.log("hover");
        });

        el.addEventListener("click", (e) => {
          e.preventDefault();

          const input = document.querySelector(
            "#imgupload",
          ) as HTMLInputElement | null;
          input?.click();
        });
        continue;
      }

      if (el.children.length > 0) {
        continue;
      }

      el.contentEditable = "true";
    }
  };

  const login = useGoogleLogin({
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
  });

  // fetch content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/content.json");
        const parsed = await res.json();

        console.log(parsed);
        setContent(parsed);
      } catch (e) {
        console.error(e);
      }
    };

    fetchContent();
  }, []);

  // load content
  useEffect(() => {
    if (!content) return;

    for (const [key, value] of Object.entries(content)) {
      const element: any = document.querySelector(`[data-lv="${key}"`);
      if (!element) return;

      if (element instanceof HTMLImageElement) {
        element.src = value as string;
        continue;
      }

      element.textContent = value;
    }

    setLoaded(true);
  }, [content]);

  const handleSave = async () => {
    const lvElements: NodeListOf<HTMLElement> =
      document.querySelectorAll(`[data-lv]`);

    const content = Object.fromEntries(
      Array.from(lvElements).map((ele: HTMLElement) => [
        [ele.getAttribute("data-lv")],
        ele.textContent,
      ]),
    );

    const res = await POST("save", content);

    if (res.status === 401) {
      console.error("Unauthorized");
      return;
    }

    if (!res.ok) {
      setReLogin(true);
      login();
      return;
    }

    const data = await res.json();
    console.log(data, res.status);

    document
      .querySelectorAll("*")
      .forEach((el: any) => (el.contentEditable = false));

    setEditing(false);
  };

  const handleCancel = async () => {
    window.location.reload();
    return;
  };

  if (!loaded) {
    document.body.style.display = "none";
  } else {
    document.body.style.display = "";
  }

  return (
    <LightVision.Provider value={{ content, setEditing, login, makeEditable }}>
      <input
        type="file"
        id="imgupload"
        name="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {children}

      {editing && (
        <div
          style={{
            position: "fixed",
            left: 0,
            bottom: 0,
            margin: ".5rem",
            display: "flex",
            gap: ".25rem",
          }}
        >
          <button
            onClick={() => handleSave()}
            style={{
              background: "#20EA6055",
              width: "50px",
              height: "50px",
              padding: "0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg
              style={{ width: "24px", height: "24px", fill: "white" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
            </svg>
          </button>
          <button
            onClick={() => handleCancel()}
            style={{
              background: "#EA202055",
              width: "50px",
              height: "50px",
              padding: "0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg
              style={{ width: "24px", height: "24px", fill: "white" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
            >
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </button>
        </div>
      )}
    </LightVision.Provider>
  );
};
