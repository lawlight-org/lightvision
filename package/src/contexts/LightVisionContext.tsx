import React from "react";
import {
  createContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import type { LightVisionType } from "../types/LightVisionType";
import { GET, POST } from "../api/api";
import { useGoogleLogin } from "@react-oauth/google";
import "../LightVision.css";
import toast from "react-hot-toast";

export const LightVisionContext = createContext<LightVisionType>({
  content: {},
  setEditing: () => {},
  login: () => {},
  makeEditable: () => {},
  reLogin: false,
  setReLogin: () => {},
  handleSave: () => {},
});

export const LightVision: FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState({});
  const [loaded, setLoaded] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [reLogin, setReLogin] = useState<boolean>(false);
  const filesRef = useRef<Record<string, File>>({});

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

  const makeImageEditable = (el: HTMLImageElement, dataLv: string) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();

      // create fake file input
      const input: HTMLInputElement = document.createElement("input");
      input.type = "file";

      // onchange set the src + ref
      input.addEventListener("change", async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log("=> uploaded file", file);

        filesRef.current[dataLv] = file;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          el.src = reader.result as string;
        };
        reader.onerror = (e) => {
          console.log("Error", e);
        };
      });
      // click it
      input.click();
    });
  };

  const makeEditable = () => {
    toast.success("Editing Mode Enabled");
    // set editing to true to make gui visible
    setEditing(true);

    // get all elements and loop through them
    const all: HTMLElement[] = Array.from(
      document.body.querySelectorAll<HTMLElement>("*"),
    );

    // get all elements with data-lv attribute and loop through them
    // const all: HTMLElement[] = Array.from(
    //   document.body.querySelectorAll<HTMLElement>("[data-lv]"),
    // );

    for (let el of all) {
      // make links not clickable
      if (
        el instanceof HTMLAnchorElement &&
        !el.classList.contains("lv-link")
      ) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
        });
      }

      // make images clickable to upload and change them
      if (el instanceof HTMLImageElement) {
        const dataLv = el.getAttribute("data-lv");
        // if (!dataLv) continue;

        el.classList.add("lv-image");

        makeImageEditable(el, dataLv);
        continue;
      }

      // if element has children, skip to not remove divs
      if (el.children.length > 0) {
        continue;
      }

      // make text editable
      el.contentEditable = "true";
    }
  };

  const handleSave = async () => {
    // scrape data-lvs from the site
    const lvElements: NodeListOf<HTMLElement> =
      document.querySelectorAll(`[data-lv]`);

    const content = Object.fromEntries(
      Array.from(lvElements).map((el: HTMLElement) => {
        const dataLv: string = el.getAttribute("data-lv") as string;

        if (el instanceof HTMLImageElement) {
          return [[dataLv], el.src];
        } else {
          return [[dataLv], el.textContent];
        }
      }),
    );

    const uploadFiles = Object.entries(filesRef.current).map(
      async ([dataLv, file]) => {
        var formData = new FormData();
        formData.append("file", file);
        formData.append("dataLv", dataLv);

        const uploadRes = await POST("upload", formData, "form");
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          const newSrc = data.message;
          console.log(newSrc);

          content[dataLv] = newSrc;

          const el = document.querySelector(`[data-lv="${dataLv}"]`);
          if (el instanceof HTMLImageElement) {
            el.src = newSrc;
          }
        }
      },
    );

    await Promise.all(uploadFiles);

    console.log("=> saving content", content);

    try {
      const res = await POST("save", content);

      if (res.status === 401) {
        setReLogin(true);
        login();
        return;
      }

      if (!res.ok) {
        console.error("Failed to save content");
        return;
      }

      const data = await res.json();
      console.log(data, res.status);

      document
        .querySelectorAll("*")
        .forEach((el: any) => (el.contentEditable = false));

      setEditing(false);
    } catch (e) {
      if (e instanceof TypeError) {
        toast.error(() => (
          <>
            Server is not running, see&nbsp;
            <a
              href="https://github.com/lawlight-org/lightvision#server-setup"
              target="_blank"
              rel="noreferrer"
              className="lv-link"
            >
              docs
            </a>
          </>
        ));
      }

      console.error(e);
    }
  };

  const handleCancel = async () => {
    window.location.reload();
    return;
  };

  // fetch content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/content.json");
        const parsed = await res.json();

        console.log("=> fetched content.json", parsed);
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

  if (!loaded) {
    document.body.style.display = "none";
  } else {
    document.body.style.display = "";
  }

  return (
    <LightVisionContext.Provider
      value={{
        content,
        setEditing,
        login,
        makeEditable,
        reLogin,
        setReLogin,
        handleSave,
      }}
    >
      {children}

      {editing && (
        <div className="lv-nav">
          <button onClick={() => handleSave()} className="lv-save-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
            </svg>
          </button>
          <button onClick={() => handleCancel()} className="lv-cancel-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </button>
        </div>
      )}
    </LightVisionContext.Provider>
  );
};
