import type { ProjectDraftRepository } from "../../repositories/ProjectDraftRepository";
import type { ProjectDraft, ProjectDraftLocale } from "../../../domain/content/entities/ProjectDraft";

export class GetProjectDraft {
  constructor(private readonly repository: ProjectDraftRepository) {}

  execute(projectId: string, locale: ProjectDraftLocale): Promise<ProjectDraft | null> {
    return this.repository.getProjectDraft(projectId, locale);
  }
}
