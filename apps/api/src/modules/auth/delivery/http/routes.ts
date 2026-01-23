import { Elysia, t } from "elysia";
import { LoginRequestSchema } from "@repo/schema/user";
import { authContainer, type AuthModuleContainer } from "./container";
import { createAuthHandlers } from "./handler";

export const authRoutes = (authModule: AuthModuleContainer) =>
  new Elysia({ name: "routes:auth" })
    .use(authContainer(authModule))
    .group("/auth", (app) =>
      app
        .post(
          "/login",
          async ({ body, set, cookie: { token }, authUseCases }) => {
            const handlers = createAuthHandlers(authUseCases);
            const result = await handlers.login(body);

            if (token) {
              token.set({
                value: result.data.token,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60,
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
        .post("/logout", async ({ cookie: { token }, set, authUseCases }) => {
          const handlers = createAuthHandlers(authUseCases);

          if (token) {
            token.remove();
          }

          set.status = 200;
          return handlers.logout();
        })
        .get("/me", async ({ cookie: { token }, set, authUseCases }) => {
          const handlers = createAuthHandlers(authUseCases);

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

          const userId = "00000000-0000-0000-0000-000000000000";
          set.status = 200;
          return handlers.getCurrentUser(userId);
        })
    );
