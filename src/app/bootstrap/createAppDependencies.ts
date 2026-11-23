import { GetPortfolioContent } from "../../application/use-cases/GetPortfolioContent";
import { StaticPortfolioRepository } from "../../infrastructure/repositories/StaticPortfolioRepository";

export function createAppDependencies() {
  const portfolioRepository = new StaticPortfolioRepository();

  return {
    getPortfolioContent: new GetPortfolioContent(portfolioRepository),
  };
}

export type AppDependencies = ReturnType<typeof createAppDependencies>;
