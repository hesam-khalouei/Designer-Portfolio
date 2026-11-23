import type { PortfolioContent } from "../../domain/content/entities/PortfolioContent";
import type { PortfolioRepository } from "../repositories/PortfolioRepository";

export class GetPortfolioContent {
  constructor(private readonly repository: PortfolioRepository) {}

  execute(): Promise<PortfolioContent> {
    return this.repository.getPortfolioContent();
  }
}
