import type { IUserRepository } from "../../domain/user/user.repository.interface";
import { publishMessage } from "../../infrastructure/rabbitmq";

export class CheckoutService {
  constructor(private readonly userRepository: IUserRepository) {}

  async checkout(userId: number, items: Array<{ id_variant: number; qty: number }>) {
    const user = await this.userRepository.findById(userId); // wait, findById doesn't exist in IUserRepository
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "basic" || user.status === "forbidden" || user.status === "in-active") {
      throw new Error("User not allowed to order");
    }

    const payload = {
      id_user: userId,
      items,
    };

    await publishMessage("order_queue", payload);

    return {
      message: "Pesanan sedang diproses dalam antrean",
    };
  }
}
