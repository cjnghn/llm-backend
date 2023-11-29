import { authz } from "@/libs/authz";
import { Elysia } from "elysia";
import { getUserByID } from "./service";

const user = (app: Elysia) =>
  app.group("/users", (app) =>
    app.use(authz).get(
      "/me",
      async ({ userId }) => {
        const me = await getUserByID(userId);

        if (!me) throw new Error("Malicious token");

        return me;
      },
      {
        detail: {
          summary: "Get current user",
          tags: ["user"],
        },
      }
    )
  );

export { user };
