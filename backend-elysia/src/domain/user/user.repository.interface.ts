import type { User, CreateUserDTO } from "./user.entity";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}
