import { Elysia, t } from "elysia";
import { Stream } from "@elysiajs/stream";

import { openai } from "@/libs/openai";
import {
  createProject,
  deleteProject,
  getProjectByID,
  paginationProjects,
  updateProject,
} from "./service";
import { insertProjectSchema, updateProjectSchema } from "@/db/schema";
// import { authz } from "@/libs/authz";

const project = (app: Elysia) =>
  app.group("/projects", (app) =>
    app
      .model({
        params: t.Object({
          projectId: t.Numeric(),
        }),
      })
      // pagination
      .get(
        "/",
        async ({ query: { offset = 0, limit = 10 } }) => {
          return paginationProjects({ offset, limit });
        },
        {
          query: t.Object({
            offset: t.Optional(t.Numeric({ default: 0 })),
            limit: t.Optional(t.Numeric({ default: 10 })),
          }),
        }
      )
      .get(
        "/:projectId",
        async ({ params: { projectId } }) => {
          return getProjectByID(projectId);
        },
        {
          params: "params",
        }
      )
      /**
       * Authorization
       */
      // .use(authz)
      .post(
        "/",
        async ({ body }) => {
          return createProject(body);
        },
        {
          body: insertProjectSchema,
        }
      )
      .put(
        "/:projectId",
        async ({ params: { projectId }, body }) => {
          return updateProject(projectId, body);
        },
        {
          params: "params",
          body: updateProjectSchema,
        }
      )
      .delete(
        "/:projectId",
        async ({ params: { projectId } }) => {
          return deleteProject(projectId);
        },
        {
          params: "params",
        }
      )
      /**
       * curl -sN -X POST http://localhost:3030/projects/1/completion -d '{"content": "Hello"}' -H "Content-Type: application/json"
       */
      .post(
        "/:projectId/completion",
        ({ body: { content } }) =>
          new Stream(
            openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "user",
                  content,
                },
              ],
              stream: true,
            })
          ),
        {
          body: t.Object({
            content: t.String({ minLength: 3 }),
          }),
        }
      )
  );

export { project };
