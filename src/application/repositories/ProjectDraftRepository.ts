import type {
  CreateProjectDraftInput,
  ProjectDraft,
  ProjectDraftListItem,
  ProjectDraftLocale,
  SaveProjectDraftInput,
} from "../../domain/content/entities/ProjectDraft";

export interface ProjectDraftRepository {
  listProjectDrafts(locale: ProjectDraftLocale): Promise<ProjectDraftListItem[]>;

  getProjectDraft(
    projectId: string,
    locale: ProjectDraftLocale,
  ): Promise<ProjectDraft | null>;

  createProject(input: CreateProjectDraftInput): Promise<ProjectDraft>;

  saveProjectDraft(input: SaveProjectDraftInput): Promise<ProjectDraft>;
}
