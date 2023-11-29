import { Elysia, t } from "elysia";

const community = (app: Elysia) =>
  app.group("/community", (app) =>
    app
      .model({
        params: t.Object({
          projectId: t.Numeric(),
        }),
      })
      // pagination
      .get("/", async ({ query: { offset = 0, limit = 10 } }) => {}, {
        query: t.Object({
          offset: t.Optional(t.Numeric({ default: 0 })),
          limit: t.Optional(t.Numeric({ default: 10 })),
        }),
      })
  );

export { community };
