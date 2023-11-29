import { Elysia } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { getUserByAccessToken, refreshSession } from "@/modules/auth/service";

const authz = (app: Elysia) =>
  app
    .use(cookie())
    .derive(async ({ setCookie, cookie: { access_token, refresh_token } }) => {
      const user = await getUserByAccessToken(access_token);
      if (user) return { userId: user.id };

      const refreshed = await refreshSession(refresh_token);

      setCookie("access_token", refreshed.session.access_token);
      setCookie("refresh_token", refreshed.session.refresh_token);

      return { userId: refreshed.user.id };
    });

export { authz };
