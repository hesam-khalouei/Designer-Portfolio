import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminAuthorizationRepository } from "../../application/repositories/AdminAuthorizationRepository";
import { AdminAuthError } from "../../application/errors/AdminAuthError";

function mapAuthorizationError(cause: unknown): AdminAuthError {
  if (cause instanceof AdminAuthError) return cause;

  const error = cause as { name?: string; code?: string };
  const name = error?.name ?? "";
  const code = error?.code ?? "";

  if (
    name === "AuthRetryableFetchError" ||
    name === "TypeError" ||
    code === "network_error" ||
    code === "fetch_error"
  ) {
    return new AdminAuthError(
      "AUTH_PROVIDER_UNAVAILABLE",
      "The authorization provider is unavailable.",
      cause,
    );
  }

  return new AdminAuthError(
    "ACCESS_DENIED",
    "Unable to verify active administrator access.",
    cause,
  );
}

export class SupabaseAdminAuthorizationRepository implements AdminAuthorizationRepository {
  constructor(private readonly client: SupabaseClient | null) {}

  async isActiveAdmin(): Promise<boolean> {
    if (!this.client) {
      throw new AdminAuthError("AUTH_PROVIDER_UNAVAILABLE", "Supabase is not configured.");
    }

    try {
      const { data, error } = await this.client
        .from("admin_profiles")
        .select("user_id")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") return false;
        throw error;
      }

      return Boolean(data?.user_id);
    } catch (cause) {
      throw mapAuthorizationError(cause);
    }
  }
}
