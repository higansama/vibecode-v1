import type { IUserRepository } from "../../domain/user/user.repository.interface";
import { InvalidCredentialsError } from "../../domain/user/user.error";
import { comparePassword } from "../../infrastructure/bcrypt";
import { generateToken } from "../../infrastructure/jwt";
import type { User } from "../../domain/user/user.entity";

export interface LoginResult {
  token: string;
  user: Omit<User, "password">;
}

export class LoginService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.password) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError("Wrong password");
    }

    const { password: _, ...userWithoutPassword } = user;
    
    const token = generateToken({ id: user.id, email: user.email });

    return {
      token,
      user: userWithoutPassword,
    };
  }
}
