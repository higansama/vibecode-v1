export class UserAlreadyExistsError extends Error {
  constructor(message: string = "User already exists") {
    super(message);
    this.name = "UserAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message: string = "Invalid credentials") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}
