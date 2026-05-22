import { Elysia } from "elysia";
import { UserRepository } from "./infrastructure/db/user.repository";
import { RegisterService } from "./application/auth/register.service";
import { LoginService } from "./application/auth/login.service";
import { registerRoute } from "./api/v1/auth/register";
import { loginRoute } from "./api/v1/auth/login";

// Dependency Injection
const userRepository = new UserRepository();
const registerService = new RegisterService(userRepository);
const loginService = new LoginService(userRepository);

const app = new Elysia()
  .get("/", () => "Hello Elysia (Clean Architecture)")
  .use(registerRoute(registerService))
  .use(loginRoute(loginService))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
