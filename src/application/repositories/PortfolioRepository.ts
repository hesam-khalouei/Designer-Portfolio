import type { PortfolioContent } from "../../domain/content/entities/PortfolioContent";

export interface PortfolioRepository {
  getPortfolioContent(): Promise<PortfolioContent>;
}
