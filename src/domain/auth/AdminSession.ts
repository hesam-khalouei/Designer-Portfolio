import type { AdminIdentity } from "./AdminIdentity";
import type { AuthAssuranceLevel } from "./AuthAssuranceLevel";

export interface AdminSession {
  readonly identity: AdminIdentity;
  readonly expiresAt: number | null;
  readonly assuranceLevel: AuthAssuranceLevel;
}
