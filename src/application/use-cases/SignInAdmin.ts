import type { AdminSession } from "../../domain/auth/AdminSession";
import type { AdminAuthRepository } from "../repositories/AdminAuthRepository";

export class SignInAdmin {
  constructor(private readonly repository: AdminAuthRepository) {}

  execute(email: string, password: string): Promise<AdminSession> {
    return this.repository.signInWithPassword(email, password);
  }
}
