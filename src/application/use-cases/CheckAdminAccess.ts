import type { AdminAuthorizationRepository } from "../repositories/AdminAuthorizationRepository";

export class CheckAdminAccess {
  constructor(private readonly repository: AdminAuthorizationRepository) {}

  execute(): Promise<boolean> {
    return this.repository.isActiveAdmin();
  }
}
