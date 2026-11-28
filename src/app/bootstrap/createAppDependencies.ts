import { GetPortfolioContent } from "../../application/use-cases/GetPortfolioContent";
import { ListProjectDrafts } from "../../application/use-cases/projects/ListProjectDrafts";
import { GetProjectDraft } from "../../application/use-cases/projects/GetProjectDraft";
import { CreateProject } from "../../application/use-cases/projects/CreateProject";
import { SaveProjectDraft } from "../../application/use-cases/projects/SaveProjectDraft";
import { SupabaseProjectDraftRepository } from "../../infrastructure/repositories/SupabaseProjectDraftRepository";
import { StaticPortfolioRepository } from "../../infrastructure/repositories/StaticPortfolioRepository";
import { SupabasePortfolioRepository } from "../../infrastructure/repositories/SupabasePortfolioRepository";
import { SupabaseAdminAuthRepository } from "../../infrastructure/repositories/SupabaseAdminAuthRepository";
import { SupabaseAdminAuthorizationRepository } from "../../infrastructure/repositories/SupabaseAdminAuthorizationRepository";
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

  const projectDraftRepository = new SupabaseProjectDraftRepository(supabase);

  return {
    projectDrafts: {
      list: new ListProjectDrafts(projectDraftRepository),
      get: new GetProjectDraft(projectDraftRepository),
      create: new CreateProject(projectDraftRepository),
      save: new SaveProjectDraft(projectDraftRepository),
    },
    getPortfolioContent: new GetPortfolioContent(portfolioRepository),
    adminAuthRepository: new SupabaseAdminAuthRepository(supabase),
    adminAuthorizationRepository: new SupabaseAdminAuthorizationRepository(supabase),
  };
}

export type AppDependencies = ReturnType<typeof createAppDependencies>;
