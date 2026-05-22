export interface Order {
  id: number;
  id_user: number;
  nominal: number;
  discount: number;
  grand_total: number;
  payment_status: "waiting" | "success" | "expired";
  payment_expired_at: Date | null;
  createdAt: Date | null;
}

export interface OrderDetail {
  id: number;
  id_variant_product_stocks_table: number;
  buy_price: number;
  qty: number;
  total_price: number;
  createdAt: Date | null;
}

export interface CheckoutPayload {
  id_user: number;
  items: Array<{
    id_variant: number;
    qty: number;
  }>;
}
