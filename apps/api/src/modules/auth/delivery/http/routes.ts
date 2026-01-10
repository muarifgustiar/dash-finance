import { Elysia, t } from "elysia";
import { LoginRequestSchema } from "@repo/schema/user";
import type { AuthHandlerDeps } from "./handler";
import { createAuthHandlers } from "./handler";

export function registerAuthRoutes(app: Elysia, deps: AuthHandlerDeps) {
  const handlers = createAuthHandlers(deps);

  return app.group("/auth", (app) =>
    app
      .post(
        "/login",
        async ({ body, set, cookie: { token } }) => {
          const result = await handlers.login(body);
          
          // Set HTTP-only cookie
          if (token) {
            token.set({
              value: result.data.token,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 7 * 24 * 60 * 60, // 7 days
              path: "/",
            });
          }

          set.status = 200;
          return result;
        },
        {
          body: t.Object({
            email: t.String({ format: "email" }),
            password: t.String({ minLength: 1 }),
          }),
        }
      )
      .post(
        "/logout",
        async ({ cookie: { token }, set }) => {
          if (token) {
            token.remove();
          }
          set.status = 200;
          return handlers.logout();
        }
      )
      .get(
        "/me",
        async ({ cookie: { token }, set }) => {
          // TODO: Extract userId from token (requires auth middleware)
          // For now, return unauthorized
          if (!token?.value) {
            set.status = 401;
            return {
              success: false,
              error: {
                code: "UNAUTHORIZED",
                message: "Unauthorized",
              },
            };
          }

          // TODO: Verify token and extract userId
          const userId = "00000000-0000-0000-0000-000000000000";
          set.status = 200;
          return handlers.getCurrentUser(userId);
        }
      )
  );
}
