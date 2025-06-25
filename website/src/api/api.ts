const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export async function GET(path: string): Promise<Response> {
  const token = localStorage.getItem("goauth_access_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res;
}

export async function POST(
  path: string,
  data: any,
  type?: string,
): Promise<Response> {
  const token = localStorage.getItem("goauth_access_token");

  const headers: any = {
    Authorization: `Bearer ${token}`,
  };

  if (type === "form") {
    headers["Content-Type"] = "multipart/form-data";
  } else {
    headers["Content-Type"] = "application/json";
  }

  const body = type === "form" ? data : JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body,
  });

  return res;
}
