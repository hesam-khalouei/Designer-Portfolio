import type { AdminAuthRepository } from "../repositories/AdminAuthRepository";

export class SignOutAdmin {
  constructor(private readonly repository: AdminAuthRepository) {}

  execute(): Promise<void> {
    return this.repository.signOut();
  }
}
