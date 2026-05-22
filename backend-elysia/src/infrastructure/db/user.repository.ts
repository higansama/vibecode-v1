import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import type { IUserRepository } from "../../domain/user/user.repository.interface";
import type { User, CreateUserDTO } from "../../domain/user/user.entity";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0) {
      return null;
    }
    return result[0] as User;
  }

  async findById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length === 0) {
      return null;
    }
    return result[0] as User;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const [result] = await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    
    // MySQL returns insertId as result.insertId for the generated PK
    const newUserId = result.insertId;
    
    const newUser = await db.select().from(users).where(eq(users.id, newUserId)).limit(1);
    return newUser[0] as User;
  }
}
