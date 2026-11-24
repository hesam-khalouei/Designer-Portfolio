import { GetPortfolioContent } from "../../application/use-cases/GetPortfolioContent";
import { StaticPortfolioRepository } from "../../infrastructure/repositories/StaticPortfolioRepository";
import { SupabasePortfolioRepository } from "../../infrastructure/repositories/SupabasePortfolioRepository";
import { supabase } from "../../infrastructure/supabase/client";

const portfolioContentSource =
  import.meta.env.VITE_PORTFOLIO_CONTENT_SOURCE?.trim() || "static";

if (portfolioContentSource !== "static" && portfolioContentSource !== "supabase") {
  throw new Error(
    `Unsupported portfolio content source: ${portfolioContentSource}`,
  );
}

export function createAppDependencies() {
  const portfolioRepository =
    portfolioContentSource === "supabase"
      ? new SupabasePortfolioRepository(supabase)
      : new StaticPortfolioRepository();

  return {
    getPortfolioContent: new GetPortfolioContent(portfolioRepository),
  };
}

export type AppDependencies = ReturnType<typeof createAppDependencies>;
