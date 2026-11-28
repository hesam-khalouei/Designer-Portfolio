export type ProjectDraftErrorCode =
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "REVISION_CONFLICT"
  | "INVALID_INPUT"
  | "ACCESS_DENIED"
  | "PERSISTENCE_UNAVAILABLE"
  | "PERSISTENCE_FAILED"
  | "INVALID_RESPONSE";

export class ProjectDraftError extends Error {
  readonly code: ProjectDraftErrorCode;
  readonly cause?: unknown;

  constructor(
    code: ProjectDraftErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = "ProjectDraftError";
    this.code = code;
    this.cause = cause;
  }
}
