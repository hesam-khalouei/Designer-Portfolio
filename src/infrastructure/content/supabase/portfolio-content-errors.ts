export type PortfolioContentErrorCode =
  | "INVALID_ROWS"
  | "INVALID_ROW"
  | "UNKNOWN_ENTITY_TYPE"
  | "DUPLICATE_ENTITY"
  | "DUPLICATE_ENTITY_ID"
  | "DUPLICATE_LOCALE"
  | "MISSING_LOCALE"
  | "INVALID_SCHEMA_VERSION"
  | "INVALID_PAYLOAD"
  | "MISSING_ENTITY"
  | "DUPLICATE_SINGLETON"
  | "INVALID_SECTION";

export class PortfolioContentDecodeError extends Error {
  readonly code: PortfolioContentErrorCode;
  readonly entityKey?: string;
  readonly locale?: string;

  constructor(
    code: PortfolioContentErrorCode,
    message: string,
    context: { entityKey?: string; locale?: string } = {},
  ) {
    super(message);
    this.name = "PortfolioContentDecodeError";
    this.code = code;
    this.entityKey = context.entityKey;
    this.locale = context.locale;
  }
}
