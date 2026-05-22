import type { IUserRepository } from "../../domain/user/user.repository.interface";
import type { CreateUserDTO, User } from "../../domain/user/user.entity";
import { UserAlreadyExistsError } from "../../domain/user/user.error";
import { hashPassword } from "../../infrastructure/bcrypt";

export class RegisterService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<Omit<User, "password">> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    if (!data.password) {
      throw new Error("Password is required");
    }

    const hashedPassword = await hashPassword(data.password);
    
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
