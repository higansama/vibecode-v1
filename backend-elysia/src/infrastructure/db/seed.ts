import { db } from "./index";
import { productsTable, variantProductStocksTable } from "./schema";

async function main() {
  console.log("Seeding products and variants...");

  // Seed Product 1
  const [product1Result] = await db.insert(productsTable).values({
    sku: "PRD-001",
    nama_produk: "Laptop Gaming Pro",
  });
  const product1Id = product1Result.insertId;

  await db.insert(variantProductStocksTable).values([
    {
      id_product: product1Id,
      sku_variant: "PRD-001-BLK",
      stock_product: 50,
      price: 15000000,
    },
    {
      id_product: product1Id,
      sku_variant: "PRD-001-SLV",
      stock_product: 30,
      price: 15500000,
    },
  ]);

  // Seed Product 2
  const [product2Result] = await db.insert(productsTable).values({
    sku: "PRD-002",
    nama_produk: "Smartphone Ultra",
  });
  const product2Id = product2Result.insertId;

  await db.insert(variantProductStocksTable).values([
    {
      id_product: product2Id,
      sku_variant: "PRD-002-128GB",
      stock_product: 100,
      price: 8000000,
    },
    {
      id_product: product2Id,
      sku_variant: "PRD-002-256GB",
      stock_product: 50,
      price: 9000000,
    },
  ]);

  console.log("Seeding completed successfully!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
