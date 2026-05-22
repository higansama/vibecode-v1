import { db } from "./index";
import { variantProductStocksTable, ordersTable, orderDetailsTable } from "./schema";
import { eq } from "drizzle-orm";
import type { IOrderRepository } from "../../domain/order/order.repository.interface";
import type { CheckoutPayload } from "../../domain/order/order.entity";

export class OrderRepository implements IOrderRepository {
  async processCheckoutTx(payload: CheckoutPayload): Promise<void> {
    await db.transaction(async (tx) => {
      let totalNominal = 0;
      const orderDetailsToInsert = [];

      for (const item of payload.items) {
        // Query the variant
        const [variant] = await tx
          .select()
          .from(variantProductStocksTable)
          .where(eq(variantProductStocksTable.id, item.id_variant))
          .limit(1);

        if (!variant) {
          throw new Error(`Variant ${item.id_variant} not found`);
        }

        if (variant.stock_product < item.qty) {
          throw new Error(`Insufficient stock for variant ${variant.sku_variant}`);
        }

        // Deduct stock
        await tx
          .update(variantProductStocksTable)
          .set({ stock_product: variant.stock_product - item.qty })
          .where(eq(variantProductStocksTable.id, variant.id));

        const itemTotal = variant.price * item.qty;
        totalNominal += itemTotal;

        orderDetailsToInsert.push({
          id_variant_product_stocks_table: variant.id,
          buy_price: variant.price,
          qty: item.qty,
          total_price: itemTotal,
        });
      }

      // Calculate totals
      const discount = 0; // Fixed for now, can be dynamic
      const grandTotal = totalNominal - discount;

      const paymentExpiredAt = new Date();
      paymentExpiredAt.setHours(paymentExpiredAt.getHours() + 1);

      // Create Order
      const [orderResult] = await tx.insert(ordersTable).values({
        id_user: payload.id_user,
        nominal: totalNominal,
        discount: discount,
        grand_total: grandTotal,
        payment_status: "waiting",
        payment_expired_at: paymentExpiredAt,
      });

      // Insert Order Details
      // Wait, order details don't have order_id in schema from the prompt!
      // The prompt specified:
      // Nama table order_details_table: id, id_variant_product_stocks_table, buy_price, qty, total_price, created_at
      // Let's insert them as requested, even without explicit foreign key to order_table.
      
      const detailsWithData = orderDetailsToInsert.map(d => ({
        ...d,
      }));

      await tx.insert(orderDetailsTable).values(detailsWithData);
    });
  }
}
