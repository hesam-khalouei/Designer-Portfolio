export type SupabasePortfolioErrorCode =
  | "SUPABASE_NOT_CONFIGURED"
  | "SUPABASE_READ_FAILED"
  | "SUPABASE_INVALID_RESPONSE";

export class SupabasePortfolioRepositoryError extends Error {
  readonly code: SupabasePortfolioErrorCode;
  readonly cause?: unknown;

  constructor(
    code: SupabasePortfolioErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = "SupabasePortfolioRepositoryError";
    this.code = code;
    this.cause = cause;
  }
}
