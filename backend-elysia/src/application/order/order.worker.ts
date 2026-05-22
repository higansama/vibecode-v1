import { OrderRepository } from "../../infrastructure/db/order.repository";
import { consumeMessage } from "../../infrastructure/rabbitmq";
import type { CheckoutPayload } from "../../domain/order/order.entity";

export const startOrderWorker = () => {
  const orderRepository = new OrderRepository();

  console.log("🐰 Order Worker is listening to order_queue...");

  consumeMessage("order_queue", async (payload: CheckoutPayload) => {
    try {
      console.log(`Processing order for user ${payload.id_user}...`);
      await orderRepository.processCheckoutTx(payload);
      console.log(`Order for user ${payload.id_user} processed successfully.`);
    } catch (error) {
      console.error(`Failed to process order for user ${payload.id_user}:`, error);
      // Let it ack and drop the message to avoid infinite loop on failed validation (e.g. stock empty)
    }
  }).catch((err) => {
    console.error("Failed to start order worker:", err);
  });
};
