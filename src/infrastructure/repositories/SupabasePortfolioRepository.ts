import type { PortfolioRepository } from "../../application/repositories/PortfolioRepository";
import { decodePortfolioContent } from "../content/supabase/portfolio-content-decoder";
import {
  SupabasePortfolioRepositoryError,
} from "./supabase-portfolio-repository-errors";

const PUBLISHED_CONTENT_COLUMNS =
  "entity_id,entity_type,entity_key,sort_order,locale_code,schema_version,payload";

type SupabaseReadResult = {
  data: unknown;
  error: unknown | null;
};

type SupabasePortfolioClient = {
  from: (table: string) => {
    select: (columns: string) => PromiseLike<SupabaseReadResult>;
  };
};

export class SupabasePortfolioRepository implements PortfolioRepository {
  constructor(private readonly client: SupabasePortfolioClient | null) {}

  async getPortfolioContent() {
    if (!this.client) {
      throw new SupabasePortfolioRepositoryError(
        "SUPABASE_NOT_CONFIGURED",
        "Supabase is not configured.",
      );
    }

    let result: SupabaseReadResult;

    try {
      result = await this.client
        .from("published_portfolio_content")
        .select(PUBLISHED_CONTENT_COLUMNS);
    } catch (cause) {
      throw new SupabasePortfolioRepositoryError(
        "SUPABASE_READ_FAILED",
        "Failed to read published portfolio content.",
        cause,
      );
    }

    if (result.error) {
      throw new SupabasePortfolioRepositoryError(
        "SUPABASE_READ_FAILED",
        "Failed to read published portfolio content.",
        result.error,
      );
    }

    if (!Array.isArray(result.data)) {
      throw new SupabasePortfolioRepositoryError(
        "SUPABASE_INVALID_RESPONSE",
        "Supabase returned an invalid published content response.",
      );
    }

    return decodePortfolioContent(result.data);
  }
}
