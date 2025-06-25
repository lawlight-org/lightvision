import validateToken from "./middleware/validateToken";
import { post } from "./routes/save";

const configFile = Bun.file("./config.json");
const config = await configFile.json();

Bun.serve({
  port: config.server_port || 1337,
  routes: {
    "/save": {
      POST: post,
    },
    "/upload": {
      POST: async (req) => {
        console.log("writing ", req.body);
        try {
          const formData = await req.formData();
          const file = formData.get("file");
          const path = config.website_path + "public/assets/img/uploaded.png";

          if (!file) {
            throw new Error("Must upload a file");
          }

          await Bun.write(path, file);
          console.log("uploaded");
        } catch (e) {
          console.log(e);
        }

        return Response.json({ message: "/upload" });
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
