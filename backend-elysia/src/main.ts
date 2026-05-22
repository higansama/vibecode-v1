import { Elysia } from "elysia";
import { UserRepository } from "./infrastructure/db/user.repository";
import { RegisterService } from "./application/auth/register.service";
import { LoginService } from "./application/auth/login.service";
import { registerRoute } from "./api/v1/auth/register";
import { loginRoute } from "./api/v1/auth/login";

import { ProductRepository } from "./infrastructure/db/product.repository";
import { ProductService } from "./application/product/product.service";
import { productRoutes } from "./api/v1/product";

import { CheckoutService } from "./application/order/checkout.service";
import { orderRoutes } from "./api/v1/order";
import { startOrderWorker } from "./application/order/order.worker";

// Dependency Injection
const userRepository = new UserRepository();
const registerService = new RegisterService(userRepository);
const loginService = new LoginService(userRepository);

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

const checkoutService = new CheckoutService(userRepository);

// Start RabbitMQ Consumer Worker
startOrderWorker();

const app = new Elysia()
  .get("/", () => "Hello Elysia (Clean Architecture)")
  .use(registerRoute(registerService))
  .use(loginRoute(loginService))
  .use(productRoutes(productService))
  .use(orderRoutes(checkoutService))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
