const configFile = Bun.file("./config.json");
const config = await configFile.json();

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: token,
      },
    });

    const data: any = await res.json();

    // console.log(data, token);

    const email = data.email;

    if (email === config.admin_email) {
      return true;
    }

    return false;
  } catch (e) {
    console.error("Failed to validateToken,", e);
    return false;
  }
};

export default validateToken;
