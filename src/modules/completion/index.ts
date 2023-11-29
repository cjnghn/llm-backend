import { Elysia, t } from "elysia";
import { Stream } from "@elysiajs/stream";

import { openai } from "@/libs/openai";

const completion = (app: Elysia) =>
  app.group("/completion", (app) =>
    app
      .get("/", async ({ query: { prompt, stream } }) => {
        if (stream === "true") {
          return new Stream(
            openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              stream: true,
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
            })
          );
        }

        return openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });
      })
      .post(
        "/",
        ({ body: { messages } }) => {
          return new Stream(
            openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              stream: true,
              messages,
            })
          );
        },
        {
          body: t.Object({
            messages: t.Array(
              t.Object({
                role: t.Union([
                  t.Literal("user"),
                  t.Literal("system"),
                  t.Literal("assistant"),
                ]),
                content: t.String(),
              })
            ),
          }),
        }
      )
  );

export { completion };
