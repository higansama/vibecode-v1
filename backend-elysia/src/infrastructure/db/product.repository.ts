import { db } from "./index";
import { productsTable, variantProductStocksTable } from "./schema";
import { eq } from "drizzle-orm";
import type { IProductRepository } from "../../domain/product/product.repository.interface";
import type { Product, VariantProductStock, CreateProductDTO } from "../../domain/product/product.entity";

export class ProductRepository implements IProductRepository {
  async create(data: CreateProductDTO): Promise<Product & { variants: VariantProductStock[] }> {
    return await db.transaction(async (tx) => {
      const [productResult] = await tx.insert(productsTable).values({
        sku: data.sku,
        nama_produk: data.nama_produk,
      });

      const productId = productResult.insertId;

      if (data.variants && data.variants.length > 0) {
        const variantValues = data.variants.map((v) => ({
          id_product: productId,
          sku_variant: v.sku_variant,
          stock_product: v.stock_product,
          price: v.price,
        }));
        await tx.insert(variantProductStocksTable).values(variantValues);
      }

      const product = await tx.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
      const variants = await tx.select().from(variantProductStocksTable).where(eq(variantProductStocksTable.id_product, productId));

      return {
        ...product[0] as Product,
        variants: variants as VariantProductStock[],
      };
    });
  }

  async findAll(): Promise<Array<Product & { variants: VariantProductStock[] }>> {
    const products = await db.select().from(productsTable);
    const variants = await db.select().from(variantProductStocksTable);

    return products.map((p) => ({
      ...p as Product,
      variants: variants.filter((v) => v.id_product === p.id) as VariantProductStock[],
    }));
  }

  async findById(id: number): Promise<(Product & { variants: VariantProductStock[] }) | null> {
    const product = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (!product.length) return null;

    const variants = await db.select().from(variantProductStocksTable).where(eq(variantProductStocksTable.id_product, id));

    return {
      ...product[0] as Product,
      variants: variants as VariantProductStock[],
    };
  }

  async delete(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(variantProductStocksTable).where(eq(variantProductStocksTable.id_product, id));
      await tx.delete(productsTable).where(eq(productsTable.id, id));
    });
  }
}
