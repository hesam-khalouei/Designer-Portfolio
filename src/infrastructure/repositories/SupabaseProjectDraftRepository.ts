import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectDraftRepository } from "../../application/repositories/ProjectDraftRepository";
import { ProjectDraftError } from "../../application/errors/ProjectDraftError";
import type {
  CreateProjectDraftInput,
  ProjectDraft,
  ProjectDraftListItem,
  ProjectDraftLocale,
  ProjectDraftSharedData,
  ProjectDraftLocalizedData,
  SaveProjectDraftInput,
} from "../../domain/content/entities/ProjectDraft";
import type { DeviceType } from "../../domain/content/entities/PortfolioContent";
import { mapProjectDraftPersistenceError } from "./supabase-project-draft-errors";

type EntityRow = {
  id: string;
  entity_key: string;
  sort_order: number;
};

type UnitRow = {
  id: string;
  entity_id: string;
  locale_code: ProjectDraftLocale;
  draft_revision_id: string | null;
};

type RevisionRow = {
  id: string;
  publication_unit_id: string;
  revision_number: number;
  payload: unknown;
};

type ProjectState = {
  entity: EntityRow;
  units: UnitRow[];
  revisions: RevisionRow[];
};

const QUERY_BATCH_SIZE = 100;

function chunkValues<T>(values: T[], size = QUERY_BATCH_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}
const PAGE_SIZE = 500;

async function fetchAllRows<T>(
  query: {
    range: (from: number, to: number) => PromiseLike<{
      data: unknown;
      error: unknown | null;
    }>;
  },
): Promise<T[]> {
  const rows: T[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const result = await query.range(offset, offset + PAGE_SIZE - 1);
    if (result.error) throw result.error;
    if (!Array.isArray(result.data)) {
      throw new ProjectDraftError(
        "INVALID_RESPONSE",
        "Supabase returned an invalid paginated response.",
      );
    }

    rows.push(...(result.data as T[]));
    if (result.data.length < PAGE_SIZE) return rows;
  }
}
const DEVICES: DeviceType[] = [
  "phone",
  "laptop",
  "tablet",
  "browser",
  "monitor",
  "multi",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSharedPayload(
  value: unknown,
  fallbackName: string,
): ProjectDraftSharedData {
  if (!isRecord(value)) {
    return { name: fallbackName, device: "multi" };
  }

  const name = typeof value.name === "string" ? value.name : fallbackName;
  const device = DEVICES.includes(value.device as DeviceType)
    ? value.device as DeviceType
    : "multi";

  return {
    name,
    device,
    ...(typeof value.image === "string" ? { image: value.image } : {}),
    ...(typeof value.secondaryImage === "string"
      ? { secondaryImage: value.secondaryImage }
      : {}),
    ...(isRecord(value.caseMedia)
      ? { caseMedia: value.caseMedia as ProjectDraftSharedData["caseMedia"] }
      : {}),
  };
}

function parseLocalizedPayload(value: unknown): ProjectDraftLocalizedData {
  if (!isRecord(value)) return {};

  return {
    ...(typeof value.category === "string" ? { category: value.category } : {}),
    ...(typeof value.sector === "string" ? { sector: value.sector } : {}),
    ...(typeof value.imageAlt === "string" ? { imageAlt: value.imageAlt } : {}),
    ...(isRecord(value.caseContent)
      ? { caseContent: value.caseContent as ProjectDraftLocalizedData["caseContent"] }
      : {}),
    ...(isRecord(value.caseMediaAlt)
      ? { caseMediaAlt: value.caseMediaAlt as ProjectDraftLocalizedData["caseMediaAlt"] }
      : {}),
  };
}

function revisionForUnit(
  unit: UnitRow | undefined,
  revisions: RevisionRow[],
): RevisionRow | undefined {
  if (!unit?.draft_revision_id) return undefined;
  return revisions.find((revision) => revision.id === unit.draft_revision_id);
}

export class SupabaseProjectDraftRepository implements ProjectDraftRepository {
  constructor(private readonly client: SupabaseClient | null) {}

  private requireClient(): SupabaseClient {
    if (!this.client) {
      throw new ProjectDraftError(
        "PERSISTENCE_UNAVAILABLE",
        "Supabase is not configured.",
      );
    }
    return this.client;
  }

  private async loadState(
    projectId: string,
    locale: ProjectDraftLocale,
  ): Promise<ProjectState | null> {
    const client = this.requireClient();

    try {
      const entityResult = await client
        .from("content_entities")
        .select("id,entity_key,sort_order")
        .eq("entity_type", "project")
        .eq("entity_key", projectId)
        .maybeSingle();

      if (entityResult.error) throw entityResult.error;
      if (!entityResult.data) return null;

      const entity = entityResult.data as EntityRow;

      const unitsResult = await client
        .from("publication_units")
        .select("id,entity_id,locale_code,draft_revision_id")
        .eq("entity_id", entity.id)
        .in("locale_code", locale === "und" ? ["und"] : ["und", locale]);

      if (unitsResult.error) throw unitsResult.error;

      const units = (unitsResult.data ?? []) as UnitRow[];
      const revisionIds = units
        .map((unit) => unit.draft_revision_id)
        .filter((id): id is string => typeof id === "string");

      const revisions: RevisionRow[] = [];

      for (const ids of chunkValues(revisionIds)) {
        const batchRevisions = await fetchAllRows<RevisionRow>(
          client
            .from("content_revisions")
            .select("id,publication_unit_id,revision_number,payload")
            .in("id", ids),
        );
        revisions.push(...batchRevisions);
      }

      return { entity, units, revisions };
    } catch (cause) {
      throw mapProjectDraftPersistenceError(cause, "read");
    }
  }

  private toDraft(
    state: ProjectState,
    locale: ProjectDraftLocale,
  ): ProjectDraft {
    const sharedUnit = state.units.find((unit) => unit.locale_code === "und");
    const localeUnit = locale === "und"
      ? sharedUnit
      : state.units.find((unit) => unit.locale_code === locale);

    const sharedRevision = revisionForUnit(sharedUnit, state.revisions);
    const localeRevision = revisionForUnit(localeUnit, state.revisions);
    const shared = parseSharedPayload(
      sharedRevision?.payload,
      state.entity.entity_key,
    );

    return {
      projectId: state.entity.entity_key,
      locale,
      revision: localeRevision?.revision_number ?? null,
      sharedRevision: sharedRevision?.revision_number ?? null,
      sortOrder: state.entity.sort_order,
      shared,
      localized: locale === "und"
        ? {}
        : parseLocalizedPayload(localeRevision?.payload),
    };
  }

  async listProjectDrafts(
    locale: ProjectDraftLocale,
  ): Promise<ProjectDraftListItem[]> {
    const client = this.requireClient();

    try {
      const entities = await fetchAllRows<EntityRow>(
        client
          .from("content_entities")
          .select("id,entity_key,sort_order")
          .eq("entity_type", "project")
          .order("sort_order", { ascending: true })
          .order("entity_key", { ascending: true }),
      );
      if (entities.length === 0) return [];

      const projectUnits: UnitRow[] = [];

      for (const entityIds of chunkValues(entities.map((entity) => entity.id))) {
        const batchUnits = await fetchAllRows<UnitRow>(
          client
            .from("publication_units")
            .select("id,entity_id,locale_code,draft_revision_id")
            .in("entity_id", entityIds)
            .in("locale_code", locale === "und" ? ["und"] : ["und", locale]),
        );
        projectUnits.push(...batchUnits);
      }
      const revisionIds = projectUnits
        .map((unit) => unit.draft_revision_id)
        .filter((id): id is string => typeof id === "string");

      const revisions: RevisionRow[] = [];

      for (const ids of chunkValues(revisionIds)) {
        const batchRevisions = await fetchAllRows<RevisionRow>(
          client
            .from("content_revisions")
            .select("id,publication_unit_id,revision_number,payload")
            .in("id", ids),
        );
        revisions.push(...batchRevisions);
      }

      return entities.map((entity) => {
        const entityUnits = projectUnits.filter((unit) => unit.entity_id === entity.id);
        const sharedUnit = entityUnits.find((unit) => unit.locale_code === "und");
        const localeUnit = locale === "und"
          ? sharedUnit
          : entityUnits.find((unit) => unit.locale_code === locale);

        const sharedRevision = revisionForUnit(sharedUnit, revisions);
        const localeRevision = revisionForUnit(localeUnit, revisions);
        const shared = parseSharedPayload(
          sharedRevision?.payload,
          entity.entity_key,
        );

        return {
          projectId: entity.entity_key,
          name: shared.name,
          device: shared.device,
          sortOrder: entity.sort_order,
          revision: localeRevision?.revision_number ?? null,
          sharedRevision: sharedRevision?.revision_number ?? null,
          hasDraft: localeRevision !== undefined,
        };
      });
    } catch (cause) {
      throw mapProjectDraftPersistenceError(cause, "read");
    }
  }

  async getProjectDraft(
    projectId: string,
    locale: ProjectDraftLocale,
  ): Promise<ProjectDraft | null> {
    const state = await this.loadState(projectId, locale);
    return state ? this.toDraft(state, locale) : null;
  }

  async createProject(input: CreateProjectDraftInput): Promise<ProjectDraft> {
    const client = this.requireClient();

    try {
      const { error } = await client.rpc("create_project_draft", {
        p_project_key: input.projectId,
        p_initial_locale: input.initialLocale,
        p_sort_order: input.sortOrder ?? 0,
        p_shared_payload: input.shared,
        p_localized_payload: input.localized ?? {},
      });

      if (error) throw error;

      const created = await this.getProjectDraft(input.projectId, input.initialLocale);
      if (!created) {
        throw new ProjectDraftError(
          "INVALID_RESPONSE",
          "The project was created but could not be read back.",
        );
      }

      return created;
    } catch (cause) {
      if (cause instanceof ProjectDraftError) throw cause;
      throw mapProjectDraftPersistenceError(cause, "create");
    }
  }

  async saveProjectDraft(input: SaveProjectDraftInput): Promise<ProjectDraft> {
    const client = this.requireClient();

    try {
      const isShared = input.locale === "und";
      const { error } = await client.rpc("save_project_draft", {
        p_project_key: input.projectId,
        p_locale: input.locale,
        p_expected_revision: input.expectedRevision,
        p_payload: isShared ? input.shared : input.localized,
        p_sort_order: isShared ? input.sortOrder ?? null : null,
      });

      if (error) throw error;

      const saved = await this.getProjectDraft(input.projectId, input.locale);
      if (!saved) {
        throw new ProjectDraftError(
          "INVALID_RESPONSE",
          "The project draft was saved but could not be read back.",
        );
      }

      return saved;
    } catch (cause) {
      if (cause instanceof ProjectDraftError) throw cause;
      throw mapProjectDraftPersistenceError(cause, "save");
    }
  }
}
