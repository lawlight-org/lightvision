import validateToken from "../middleware/validateToken";

const configFile = Bun.file("./config.json");
const config = await configFile.json();

export const post = async (req: any) => {
  const token: string | null = req.headers.toJSON().authorization as string;

  // token handling
  if (!token) {
    return Response.json({ message: "No token" }, { status: 400 });
  }

  if (!(await validateToken(token))) {
    return Response.json({ message: "Invalid email address" }, { status: 401 });
  }

  // body handling
  try {
    const incomingContent: any = await req.json();

    const contentFile = Bun.file(config.website_path + "public/content.json");
    const currentContent = await contentFile.json();

    // console.log("\nIncoming", incomingContent);
    // console.log("Current", currentContent);

    // hashmapping so no only corresponding ones are changed, no new data
    for (const key of Object.keys(currentContent)) {
      currentContent[key] = incomingContent[key];
    }

    // console.log("Updated", currentContent);

    // write to file
    await Bun.write(contentFile, JSON.stringify(currentContent));

    return Response.json({ message: "/save" });
  } catch (e) {
    console.error("Invalid JSON", e);
    return Response.json({ message: "Failed to save" }, { status: 400 });
  }
};
