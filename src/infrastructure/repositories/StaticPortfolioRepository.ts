import type { PortfolioRepository } from "../../application/repositories/PortfolioRepository";
import { staticPortfolioContent } from "../content/static/portfolio-content";

export class StaticPortfolioRepository implements PortfolioRepository {
  async getPortfolioContent() {
    return staticPortfolioContent;
  }
}
