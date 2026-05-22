import { Elysia, t } from "elysia";
import type { CheckoutService } from "../../../application/order/checkout.service";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const orderRoutes = (checkoutService: CheckoutService) =>
  new Elysia({ prefix: "/api/v1/order" })
    .post("/checkout", async ({ body, headers, set }) => {
      try {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          set.status = 401;
          return { success: false, message: "Unauthorized" };
        }

        const token = authHeader.split(" ")[1];
        let decoded: any;
        try {
          decoded = jwt.verify(token, JWT_SECRET);
        } catch (e) {
          set.status = 401;
          return { success: false, message: "Invalid token" };
        }

        const userId = decoded.id;
        if (!userId) {
          set.status = 401;
          return { success: false, message: "Invalid token payload" };
        }

        const result = await checkoutService.checkout(userId, body.items);

        set.status = 200;
        return {
          success: true,
          message: result.message,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          success: false,
          message: error.message || "Checkout failed",
        };
      }
    }, {
      body: t.Object({
        items: t.Array(
          t.Object({
            id_variant: t.Number(),
            qty: t.Number(),
          })
        ),
      })
    });
