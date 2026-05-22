export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string | null;
  createdAt: Date | null;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}
