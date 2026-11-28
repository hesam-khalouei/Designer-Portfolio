import type { ProjectDraftRepository } from "../../repositories/ProjectDraftRepository";
import type { ProjectDraftLocale, ProjectDraftListItem } from "../../../domain/content/entities/ProjectDraft";

export class ListProjectDrafts {
  constructor(private readonly repository: ProjectDraftRepository) {}

  execute(locale: ProjectDraftLocale): Promise<ProjectDraftListItem[]> {
    return this.repository.listProjectDrafts(locale);
  }
}
