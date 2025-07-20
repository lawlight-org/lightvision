import validateToken from "./middleware/validateToken";
import { post } from "./routes/save";

const configFile = Bun.file("./config.json");
const config = await configFile.json();

async function removePreviousFile(dataLv: string) {
  try {
    // remove file from current content
    const contentFile = Bun.file(config.website_path + "public/content.json");
    console.log("1", contentFile);

    const currentContent = await contentFile.json();

    console.log("2", currentContent);
    const pathToRemove =
      config.website_path + "public/" + currentContent[dataLv];

    const fileToRemove = Bun.file(pathToRemove);

    console.log("3", fileToRemove, pathToRemove);

    if (fileToRemove) await fileToRemove.delete();
    console.log("removed the old one");
  } catch (e) {
    console.error("failed");
  }
}

Bun.serve({
  port: config.server_port || 1337,
  routes: {
    "/save": {
      POST: post,
    },
    "/upload": {
      POST: async (req) => {
        // console.log("writing ", req.body);
        try {
          const formData = await req.formData();
          const file = formData.get("file") as any;
          const dataLv: string | null = formData.get("dataLv") as string;
          const subPath = `assets/img/${Bun.randomUUIDv7()}.png`;
          const path = config.website_path + "public/" + subPath;

          if (!file) {
            throw new Error("Must upload a file");
          }

          // write to file
          await Bun.write(path, file);
          console.log("uploaded");

          removePreviousFile(dataLv);

          return Response.json({ message: subPath });
        } catch (e) {
          console.log(e);
          return Response.json(
            { message: "Failed to upload file" },
            { status: 404 },
          );
        }
      },
    },
    "/auth": {
      GET: async (req) => {
        const token: string | null = req.headers.toJSON()
          .authorization as string;

        // token handling
        if (!token) {
          return Response.json({ message: "No token" }, { status: 400 });
        }

        if (!(await validateToken(token))) {
          return Response.json(
            { message: "Invalid email address" },
            { status: 401 },
          );
        }

        return Response.json({ message: "All good" });
      },
    },
  },
});
