import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import {
  refreshSession,
  signInWithPassword,
  signUpWithPassword,
} from "./service";

const auth = (app: Elysia) =>
  app
    .model({
      userWithoutPassword: t.Object({
        id: t.Integer(),
        email: t.String({ format: "email" }),
        createdAt: t.String({ format: "date-time" }),
      }),
    })
    .use(
      cookie({
        httpOnly: true,
        // If you need cookie to deliver via https only
        // secure: true,
        //
        // If you need a cookie to be available for same-site only
        // sameSite: "strict",
        //
        // If you want to encrypt a cookie
        // signed: true,
        // secret: process.env.COOKIE_SECRET
      })
    )
    .group("/auth", (app) =>
      app
        .model({
          sign: t.Object({
            email: t.String({ format: "email" }),
            password: t.String({ minLength: 8 }),
          }),
        })
        .post(
          "/sign-up",
          async ({ body: { email, password } }) => {
            return signUpWithPassword({ email, password });
          },
          {
            body: "sign",
            detail: {
              description: "Sign up with email and password",
              tags: ["Authentication"],
            },
          }
        )
        .post(
          "/sign-in",
          async ({ body: { email, password }, setCookie }) => {
            const data = await signInWithPassword({ email, password });

            setCookie("access_token", data.session.access_token);
            setCookie("refresh_token", data.session.refresh_token);

            return data.user;
          },
          {
            body: "sign",
            detail: {
              description: "Sign in with email and password",
              tags: ["Authentication"],
            },
          }
        )
        .get(
          "/refresh",
          async ({ setCookie, cookie: { refresh_token } }) => {
            const data = await refreshSession(refresh_token);
            if (!data.session) {
              throw new Error("Invalid refresh token");
            }

            setCookie("refresh_token", data.session.refresh_token);

            return data;
          },
          {
            detail: {
              description: "Renew access_token",
              tags: ["Authentication", "Authorized"],
            },
          }
        )
    );

export { auth };
