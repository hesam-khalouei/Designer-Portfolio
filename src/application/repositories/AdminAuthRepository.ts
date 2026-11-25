import type { AdminSession } from "../../domain/auth/AdminSession";

export interface AdminAuthRepository {
  signInWithPassword(
    email: string,
    password: string,
  ): Promise<AdminSession>;

  getCurrentSession(): Promise<AdminSession | null>;

  signOut(): Promise<void>;

  subscribeToAuthChanges(
    listener: (session: AdminSession | null) => void,
  ): () => void;
}
