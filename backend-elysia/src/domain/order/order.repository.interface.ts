import type { CheckoutPayload } from "./order.entity";

export interface IOrderRepository {
  processCheckoutTx(payload: CheckoutPayload): Promise<void>;
}
