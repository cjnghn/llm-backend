import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { auth, completion, community, project, task, user } from "@/modules";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(auth)
  .use(completion)
  .use(community)
  .use(project)
  .use(task)
  .use(user)
  .listen(3030);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
