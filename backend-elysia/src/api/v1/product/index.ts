import { Elysia, t } from "elysia";
import type { ProductService } from "../../../application/product/product.service";

export const productRoutes = (productService: ProductService) =>
  new Elysia({ prefix: "/api/v1/product" })
    .post("/", async ({ body, set }) => {
      try {
        const product = await productService.createProduct(body);
        set.status = 201;
        return {
          success: true,
          message: "Product created successfully",
          data: product,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          success: false,
          message: error.message || "Failed to create product",
        };
      }
    }, {
      body: t.Object({
        sku: t.String(),
        nama_produk: t.String(),
        variants: t.Array(
          t.Object({
            sku_variant: t.String(),
            stock_product: t.Number(),
            price: t.Number(),
          })
        ),
      })
    })
    .get("/", async ({ set }) => {
      try {
        const products = await productService.getAllProducts();
        return {
          success: true,
          message: "Products retrieved successfully",
          data: products,
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Internal server error",
          detail: error.message,
        };
      }
    })
    .get("/:id", async ({ params: { id }, set }) => {
      try {
        const product = await productService.getProductById(Number(id));
        return {
          success: true,
          message: "Product retrieved successfully",
          data: product,
        };
      } catch (error: any) {
        set.status = 404;
        return {
          success: false,
          message: error.message || "Product not found",
        };
      }
    })
    .delete("/:id", async ({ params: { id }, set }) => {
      try {
        await productService.deleteProduct(Number(id));
        return {
          success: true,
          message: "Product deleted successfully",
        };
      } catch (error: any) {
        set.status = 404;
        return {
          success: false,
          message: error.message || "Failed to delete product",
        };
      }
    });
