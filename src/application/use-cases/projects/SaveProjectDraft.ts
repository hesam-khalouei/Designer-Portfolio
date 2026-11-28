import type { ProjectDraftRepository } from "../../repositories/ProjectDraftRepository";
import type { ProjectDraft, SaveProjectDraftInput } from "../../../domain/content/entities/ProjectDraft";

export class SaveProjectDraft {
  constructor(private readonly repository: ProjectDraftRepository) {}

  execute(input: SaveProjectDraftInput): Promise<ProjectDraft> {
    return this.repository.saveProjectDraft(input);
  }
}
