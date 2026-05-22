import { Elysia, t } from "elysia";
import type { LoginService } from "../../../application/auth/login.service";
import { InvalidCredentialsError } from "../../../domain/user/user.error";

export const loginRoute = (loginService: LoginService) =>
  new Elysia().post("/api/v1/auth/login", async ({ body, set }) => {
    try {
      const result = await loginService.execute(body.email, body.password);

      set.status = 200;
      return {
        success: true,
        message: "User logged in successfully",
        data: result,
      };
    } catch (error: any) {
      if (error instanceof InvalidCredentialsError) {
        set.status = 401;
        return {
          success: false,
          message: error.message,
        };
      }

      set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        detail: error.message,
      };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  });
