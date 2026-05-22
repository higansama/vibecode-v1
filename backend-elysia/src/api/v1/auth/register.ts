import { Elysia, t } from "elysia";
import type { RegisterService } from "../../../application/auth/register.service";
import { UserAlreadyExistsError } from "../../../domain/user/user.error";

export const registerRoute = (registerService: RegisterService) => 
  new Elysia().post("/api/v1/auth/register", async ({ body, set }) => {
    try {
      const user = await registerService.execute({
        name: body.name,
        email: body.email,
        password: body.password,
      });

      set.status = 201;
      return {
        success: true,
        message: "User created successfully",
        data: user,
      };
    } catch (error: any) {
      if (error instanceof UserAlreadyExistsError) {
        set.status = 400;
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
      name: t.String(),
      email: t.String(),
      password: t.String(),
    })
  });
