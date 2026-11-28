import { ProjectDraftError } from "../../application/errors/ProjectDraftError";

type PersistenceOperation = "read" | "create" | "save";

export function mapProjectDraftPersistenceError(
  cause: unknown,
  operation: PersistenceOperation,
): ProjectDraftError {
  if (cause instanceof ProjectDraftError) return cause;

  const error = cause as {
    code?: string;
    message?: string;
    details?: string;
    name?: string;
  };

  const code = error?.code ?? "";
  const message = error?.message ?? "";

  if (code === "42501" || message.includes("ACCESS_DENIED")) {
    return new ProjectDraftError(
      "ACCESS_DENIED",
      "Active administrator access is required.",
      cause,
    );
  }

  if (code === "23505" || message.includes("duplicate key")) {
    return new ProjectDraftError(
      "ALREADY_EXISTS",
      "A project with this stable key already exists.",
      cause,
    );
  }

  if (message.includes("REVISION_CONFLICT")) {
    return new ProjectDraftError(
      "REVISION_CONFLICT",
      "The project draft changed. Reload it before saving again.",
      cause,
    );
  }

  if (
    message.includes("NOT_FOUND") ||
    message.includes("SHARED_DRAFT_NOT_FOUND") ||
    code === "P0002"
  ) {
    return new ProjectDraftError(
      "NOT_FOUND",
      "The requested project or shared draft was not found.",
      cause,
    );
  }

  if (
    code === "22023" ||
    message.includes("INVALID_") ||
    message.includes("SORT_ORDER_REQUIRES_SHARED_LOCALE")
  ) {
    return new ProjectDraftError(
      "INVALID_INPUT",
      "The project draft contains invalid data.",
      cause,
    );
  }

  if (
    error?.name === "TypeError" ||
    message.toLowerCase().includes("network") ||
    message.toLowerCase().includes("fetch")
  ) {
    return new ProjectDraftError(
      "PERSISTENCE_UNAVAILABLE",
      "The project content service is unavailable.",
      cause,
    );
  }

  return new ProjectDraftError(
    operation === "read" ? "PERSISTENCE_UNAVAILABLE" : "PERSISTENCE_FAILED",
    "The project draft operation failed.",
    cause,
  );
}
