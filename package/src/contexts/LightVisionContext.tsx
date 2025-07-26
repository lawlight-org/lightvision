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
import { POST } from "../api/api";
import { login } from "../services/auth";

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

  const makeImageEditable = (el: HTMLImageElement, dataLv: string) => {
    // onclick create fake file input, click it and onchange set the src + ref
    el.addEventListener("click", (e) => {
      e.preventDefault();

      const input: HTMLInputElement = document.createElement("input");
      input.type = "file";

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

        // var data = new FormData();
        // data.append("file", e.target.files[0]);
        // data.append("dataLv", dataLv);
        //
        // const res = await POST("upload", data, "form");
        // if (res.ok) {
        //   const data = await res.json();
        //   const tmpSubPath = data.message;
        //   el.src = tmpSubPath;
        // } else {
        //   console.error("Failed to upload the file", res.status);
        // }
      });
      input.click();
    });
  };

  const makeEditable = () => {
    setEditing(true);

    const all: HTMLElement[] = Array.from(
      document.body.querySelectorAll<HTMLElement>("*"),
    );

    console.log("=> Making elements editable");

    // loop through all elements
    for (let el of all) {
      // make links not clickable
      if (el instanceof HTMLAnchorElement) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
        });
      }

      // make images clickable to upload and change them
      if (el instanceof HTMLImageElement) {
        const dataLv = el.getAttribute("data-lv");
        if (!dataLv) continue;

        makeImageEditable(el, dataLv);

        continue;
      }

      if (el.children.length > 0) {
        continue;
      }

      el.contentEditable = "true";
    }
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

    const res = await POST("save", content);

    if (res.status === 404) {
      console.error("Make sure the server is running");
      return;
    }

    if (res.status === 401) {
      setReLogin(true);
      login();
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
    </LightVisionContext.Provider>
  );
};
