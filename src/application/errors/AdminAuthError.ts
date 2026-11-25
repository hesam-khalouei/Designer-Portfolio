export type AdminAuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "SESSION_EXPIRED"
  | "NOT_AUTHENTICATED"
  | "ACCESS_DENIED"
  | "MFA_REQUIRED"
  | "RATE_LIMITED"
  | "AUTH_PROVIDER_UNAVAILABLE"
  | "AUTH_OPERATION_FAILED";

export class AdminAuthError extends Error {
  readonly code: AdminAuthErrorCode;
  readonly cause?: unknown;

  constructor(
    code: AdminAuthErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = "AdminAuthError";
    this.code = code;
    this.cause = cause;
  }
}
