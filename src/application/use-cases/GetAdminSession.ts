import type { AdminSession } from "../../domain/auth/AdminSession";
import type { AdminAuthRepository } from "../repositories/AdminAuthRepository";

export class GetAdminSession {
  constructor(private readonly repository: AdminAuthRepository) {}

  execute(): Promise<AdminSession | null> {
    return this.repository.getCurrentSession();
  }
}
