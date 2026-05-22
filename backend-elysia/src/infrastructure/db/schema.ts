import {
  mysqlTable,
  serial,
  varchar,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("basic"),
  status: varchar("status", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productsTable = mysqlTable("products_table", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 32 }).notNull(),
  nama_produk: varchar("nama_produk", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const variantProductStocksTable = mysqlTable(
  "variant_product_stocks_table",
  {
    id: serial("id").primaryKey(),
    id_product: int("id_product").notNull(),
    sku_variant: varchar("sku_variant", { length: 32 }).notNull(),
    stock_product: int("stock_product", { unsigned: true }).notNull(),
    price: int("price", { unsigned: true }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
);

export const ordersTable = mysqlTable("orders_table", {
  id: serial("id").primaryKey(),
  id_user: int("id_user").notNull(),
  nominal: int("nominal").notNull(),
  discount: int("discount").notNull(),
  grand_total: int("grand_total").notNull(),
  payment_status: varchar("payment_status", { length: 32 }).notNull(),
  payment_expired_at: timestamp("payment_expired_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderDetailsTable = mysqlTable("order_details_table", {
  id: serial("id").primaryKey(),
  id_variant_product_stocks_table: int(
    "id_variant_product_stocks_table",
  ).notNull(),
  buy_price: int("buy_price").notNull(),
  qty: int("qty").notNull(),
  total_price: int("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
