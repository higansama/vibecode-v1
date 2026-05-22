export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date | null;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}
