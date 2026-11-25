import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { AdminAuthRepository } from "../../application/repositories/AdminAuthRepository";
import { AdminAuthError } from "../../application/errors/AdminAuthError";
import type { AdminSession } from "../../domain/auth/AdminSession";

type SupabaseAuthErrorLike = {
  code?: unknown;
  status?: unknown;
  name?: unknown;
};

function mapAuthError(cause: unknown): AdminAuthError {
  if (cause instanceof AdminAuthError) return cause;

  const error = (
    typeof cause === "object" && cause !== null
      ? cause
      : {}
  ) as SupabaseAuthErrorLike;

  const code = typeof error.code === "string" ? error.code : "";
  const name = typeof error.name === "string" ? error.name : "";
  const status = typeof error.status === "number" ? error.status : undefined;

  if (status === 429 || code.includes("rate_limit")) {
    return new AdminAuthError("RATE_LIMITED", "Authentication rate limit exceeded.", cause);
  }

  if (code === "invalid_credentials" || code === "invalid_grant") {
    return new AdminAuthError("INVALID_CREDENTIALS", "Invalid email or password.", cause);
  }

  if (code === "session_expired" || code === "refresh_token_not_found" || code === "refresh_token_already_used") {
    return new AdminAuthError("SESSION_EXPIRED", "The authentication session has expired.", cause);
  }

  if (code === "session_not_found" || code === "auth_session_missing") {
    return new AdminAuthError("NOT_AUTHENTICATED", "No authenticated session is available.", cause);
  }

  if (
    name === "AuthRetryableFetchError" ||
    name === "TypeError" ||
    code === "network_error" ||
    code === "fetch_error"
  ) {
    return new AdminAuthError("AUTH_PROVIDER_UNAVAILABLE", "The authentication provider is unavailable.", cause);
  }

  return new AdminAuthError("AUTH_OPERATION_FAILED", "The authentication operation failed.", cause);
}

function toAdminSession(session: Session): AdminSession {
  const email = session.user.email?.trim();

  if (!session.user.id || !email) {
    throw new AdminAuthError(
      "AUTH_OPERATION_FAILED",
      "Supabase returned an incomplete user identity.",
    );
  }

  const expiresAt =
    typeof session.expires_at === "number" &&
    Number.isFinite(session.expires_at)
      ? session.expires_at * 1000
      : null;

  return {
    identity: {
      id: session.user.id,
      email,
    },
    expiresAt,
    assuranceLevel: "aal1",
  };
}

export class SupabaseAdminAuthRepository implements AdminAuthRepository {
  constructor(private readonly client: SupabaseClient | null) {}

  async signInWithPassword(email: string, password: string): Promise<AdminSession> {
    if (!this.client) {
      throw new AdminAuthError("AUTH_PROVIDER_UNAVAILABLE", "Supabase is not configured.");
    }

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw mapAuthError(error);
      if (!data.session) {
        throw new AdminAuthError("NOT_AUTHENTICATED", "Supabase did not establish a session.");
      }

      return toAdminSession(data.session);
    } catch (cause) {
      throw mapAuthError(cause);
    }
  }

  async getCurrentSession(): Promise<AdminSession | null> {
    if (!this.client) {
      throw new AdminAuthError("AUTH_PROVIDER_UNAVAILABLE", "Supabase is not configured.");
    }

    try {
      const { data, error } = await this.client.auth.getSession();

      if (error) throw mapAuthError(error);
      return data.session ? toAdminSession(data.session) : null;
    } catch (cause) {
      throw mapAuthError(cause);
    }
  }

  async signOut(): Promise<void> {
    if (!this.client) {
      throw new AdminAuthError("AUTH_PROVIDER_UNAVAILABLE", "Supabase is not configured.");
    }

    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw mapAuthError(error);
    } catch (cause) {
      throw mapAuthError(cause);
    }
  }

  subscribeToAuthChanges(
    listener: (session: AdminSession | null) => void,
  ): () => void {
    if (!this.client) {
      throw new AdminAuthError("AUTH_PROVIDER_UNAVAILABLE", "Supabase is not configured.");
    }

    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      try {
        listener(session ? toAdminSession(session) : null);
      } catch {
        // Invalid session data must never be exposed as an authenticated identity.
        listener(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }
}
