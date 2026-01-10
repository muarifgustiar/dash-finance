import { Elysia, t } from "elysia";
import { UserModuleContainer } from "../../module.container";
import {
  CreateUserRequestSchema,
  GetUsersQuerySchema,
} from "@repo/schema/user";
import { success } from "../../../../shared/util";
import { mapErrorToResponse, getHttpStatus } from "../../../../shared/errors";
import type { DomainError } from "../../../../shared/errors";

/**
 * User Routes - Delivery Layer
 * ✅ THIN: Only validation, delegation, and error mapping
 * No business logic here
 */

const container = UserModuleContainer.getInstance();

export const registerUserRoutes = (app: Elysia) => {
  return app.group("/users", (app) =>
    app
      // Create User
      .post(
        "/",
        async ({ body, set }) => {
          try {
            const useCase = container.getCreateUserUseCase();
            const result = await useCase.execute(body);
            return success(result);
          } catch (error) {
            const domainError = error as DomainError;
            set.status = getHttpStatus(domainError);
            return mapErrorToResponse(error);
          }
        },
        {
          body: t.Object({
            email: t.String({ format: "email" }),
            name: t.String({ minLength: 1 }),
            password: t.String({ minLength: 8 }),
          }),
        }
      )

      // Get User by ID
      .get(
        "/:id",
        async ({ params, set }) => {
          try {
            const useCase = container.getGetUserUseCase();
            const result = await useCase.execute(params.id);
            return success(result);
          } catch (error) {
            const domainError = error as DomainError;
            set.status = getHttpStatus(domainError);
            return mapErrorToResponse(error);
          }
        }
      )

      // List Users
      .get(
        "/",
        async ({ query }) => {
          try {
            const validated = GetUsersQuerySchema.parse(query);
            // TODO: Implement list logic
            return success({
              items: [],
              pagination: {
                page: validated.page,
                limit: validated.limit,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
              },
            });
          } catch (error) {
            return mapErrorToResponse(error);
          }
        }
      )
  );
};
