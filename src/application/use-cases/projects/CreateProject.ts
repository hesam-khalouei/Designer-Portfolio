import type { ProjectDraftRepository } from "../../repositories/ProjectDraftRepository";
import type { CreateProjectDraftInput, ProjectDraft } from "../../../domain/content/entities/ProjectDraft";

export class CreateProject {
  constructor(private readonly repository: ProjectDraftRepository) {}

  execute(input: CreateProjectDraftInput): Promise<ProjectDraft> {
    return this.repository.createProject(input);
  }
}
