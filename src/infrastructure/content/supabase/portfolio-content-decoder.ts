import type {
  Capability,
  Certification,
  DeviceType,
  Experience,
  Metric,
  PortfolioContent,
  Profile,
  Project,
  ProjectVisual,
  Service,
} from "../../../domain/content/entities/PortfolioContent";
import type { Text } from "../../../domain/localization/LocalizedText";
import { PortfolioContentDecodeError } from "./portfolio-content-errors";

const LOCALES = ["en", "fa", "ar", "und"] as const;
const LOCALIZED_LOCALES = ["en", "fa", "ar"] as const;
const SCHEMA_VERSION = 1;

const ENTITY_TYPES = [
  "profile",
  "summary",
  "project",
  "experience",
  "metric",
  "capability",
  "service",
  "certification",
] as const;

const CASE_SECTIONS = [
  "overview",
  "context",
  "role",
  "challengeSection",
  "research",
  "journey",
  "exploration",
  "final",
  "decisions",
  "results",
] as const;

type Locale = (typeof LOCALES)[number];
type EntityType = (typeof ENTITY_TYPES)[number];
type Row = {
  entity_id: string;
  entity_type: EntityType;
  entity_key: string;
  sort_order: number;
  locale_code: Locale;
  schema_version: number;
  payload: Record<string, unknown>;
};

type EntityGroup = {
  entityId: string;
  type: EntityType;
  key: string;
  sortOrder: number;
  rows: Map<Locale, Row>;
};

type JsonObject = Record<string, unknown>;

function fail(
  code: ConstructorParameters<typeof PortfolioContentDecodeError>[0],
  message: string,
  context: { entityKey?: string; locale?: string } = {},
): never {
  throw new PortfolioContentDecodeError(code, message, context);
}

function object(value: unknown, path: string): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail("INVALID_PAYLOAD", `${path} must be a JSON object.`);
  }
  return value as JsonObject;
}

function requiredString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail("INVALID_PAYLOAD", `${path} must be a non-empty string.`);
  }
  return value;
}

function optionalString(
  value: unknown,
  path: string,
): string | undefined {
  if (value === undefined) return undefined;
  return requiredString(value, path);
}

function stringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    fail("INVALID_PAYLOAD", `${path} must be an array.`);
  }
  return value.map((item, index) =>
    requiredString(item, `${path}[${index}]`),
  );
}

function localizedText(
  group: EntityGroup,
  field: string,
): Text {
  return LOCALIZED_LOCALES.map((locale) =>
    requiredString(
      payload(group, locale)[field],
      `${group.type}.${group.key}.${locale}.${field}`,
    ),
  ) as Text;
}

function localizedStringArray(group: EntityGroup, field: string): Text[] {
  const arrays = LOCALIZED_LOCALES.map((locale) =>
    stringArray(
      payload(group, locale)[field],
      `${group.key}.${locale}.${field}`,
    ),
  );

  if (!arrays.every((items) => items.length === arrays[0].length)) {
    fail(
      "INVALID_PAYLOAD",
      `Localized array "${field}" must have matching lengths across locales.`,
      { entityKey: group.key },
    );
  }

  return arrays[0].map((_, index) => [
    arrays[0][index],
    arrays[1][index],
    arrays[2][index],
  ]);
}

function optionalEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    fail("INVALID_PAYLOAD", `${path} must be a string.`);
  }
  return value;
}

function payload(group: EntityGroup, locale: Locale): JsonObject {
  const row = group.rows.get(locale);
  if (!row) {
    fail("MISSING_LOCALE", `Missing ${locale} publication.`, {
      entityKey: group.key,
      locale,
    });
  }
  return row.payload;
}

function assertEmptyUnd(group: EntityGroup): void {
  const shared = payload(group, "und");
  if (Object.keys(shared).length !== 0) {
    fail(
      "INVALID_PAYLOAD",
      `${group.type}.${group.key}.und must be an empty object.`,
      { entityKey: group.key, locale: "und" },
    );
  }
}

function sharedObject(group: EntityGroup): JsonObject {
  return payload(group, "und");
}

function deviceType(value: unknown, path: string): DeviceType {
  const allowed: DeviceType[] = [
    "phone",
    "laptop",
    "tablet",
    "browser",
    "monitor",
    "multi",
  ];
  if (typeof value !== "string" || !allowed.includes(value as DeviceType)) {
    fail("INVALID_PAYLOAD", `${path} has an unsupported device type.`);
  }
  return value as DeviceType;
}

function localizedObjectMap(
  value: unknown,
  path: string,
): Record<string, string> {
  const source = object(value, path);
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(source)) {
    if (!CASE_SECTIONS.includes(key as (typeof CASE_SECTIONS)[number])) {
      fail("INVALID_SECTION", `${path} contains unknown section "${key}".`);
    }
    result[key] = requiredString(item, `${path}.${key}`);
  }
  return result;
}

function sharedMediaMap(
  value: unknown,
  path: string,
): Record<string, ProjectVisual> {
  const source = object(value, path);
  const result: Record<string, ProjectVisual> = {};

  for (const [key, item] of Object.entries(source)) {
    if (!CASE_SECTIONS.includes(key as (typeof CASE_SECTIONS)[number])) {
      fail("INVALID_SECTION", `${path} contains unknown section "${key}".`);
    }

    const visual = object(item, `${path}.${key}`);
    const mapped: ProjectVisual = {};
    const image = optionalString(visual.image, `${path}.${key}.image`);
    const secondaryImage = optionalString(
      visual.secondaryImage,
      `${path}.${key}.secondaryImage`,
    );

    if (image !== undefined) mapped.image = image;
    if (secondaryImage !== undefined) mapped.secondaryImage = secondaryImage;
    if (visual.device !== undefined) {
      mapped.device = deviceType(visual.device, `${path}.${key}.device`);
    }
    result[key] = mapped;
  }

  return result;
}

function mapProjectCaseStudy(group: EntityGroup): {
  caseContent?: Project["caseContent"];
  caseMedia?: Project["caseMedia"];
} {
  const contentBySection: Record<string, Text> = {};
  const mediaBySection: Record<string, ProjectVisual> = {};

  const shared = sharedObject(group);
  const sharedMedia = sharedMediaMap(
    shared.caseMedia ?? {},
    `${group.key}.und.caseMedia`,
  );

  const localizedContent = LOCALIZED_LOCALES.map((locale) =>
    localizedObjectMap(
      payload(group, locale).caseContent ?? {},
      `${group.key}.${locale}.caseContent`,
    ),
  );

  const localizedAlt = LOCALIZED_LOCALES.map((locale) =>
    localizedObjectMap(
      payload(group, locale).caseMediaAlt ?? {},
      `${group.key}.${locale}.caseMediaAlt`,
    ),
  );

  for (const section of CASE_SECTIONS) {
    const contentValues = localizedContent.map((item) => item[section]);
    if (contentValues.some((value) => value !== undefined)) {
      if (contentValues.some((value) => value === undefined)) {
        fail(
          "INVALID_PAYLOAD",
          `Case Study content "${section}" must exist in all three locales.`,
          { entityKey: group.key },
        );
      }
      contentBySection[section] = contentValues as Text;
    }

    const altValues = localizedAlt.map((item) => item[section]);
    if (altValues.some((value) => value !== undefined)) {
      if (altValues.some((value) => value === undefined)) {
        fail(
          "INVALID_PAYLOAD",
          `Case Study alternative text "${section}" must exist in all three locales.`,
          { entityKey: group.key },
        );
      }
    }

    const visual = sharedMedia[section];
    const hasAlt = altValues.every((value) => value !== undefined);
    if (visual || hasAlt) {
      mediaBySection[section] = {
        ...visual,
        ...(hasAlt ? { imageAlt: altValues as Text } : {}),
      };
    }
  }

  const caseContent: NonNullable<Project["caseContent"]> = {};
  const caseMedia: NonNullable<Project["caseMedia"]> = {};

  CASE_SECTIONS.forEach((section, index) => {
    if (contentBySection[section]) {
      caseContent[index] = contentBySection[section];
    }
    if (mediaBySection[section]) {
      caseMedia[index] = mediaBySection[section];
    }
  });

  return {
    ...(Object.keys(caseContent).length ? { caseContent } : {}),
    ...(Object.keys(caseMedia).length ? { caseMedia } : {}),
  };
}

function parseRow(value: unknown): Row {
  const source = object(value, "published row");
  const entityId = requiredString(source.entity_id, "entity_id");
  const entityKey = requiredString(source.entity_key, "entity_key");

  if (
    typeof source.entity_type !== "string" ||
    !ENTITY_TYPES.includes(source.entity_type as EntityType)
  ) {
    fail(
      "UNKNOWN_ENTITY_TYPE",
      `Unknown entity type "${String(source.entity_type)}".`,
      { entityKey },
    );
  }

  if (
    typeof source.locale_code !== "string" ||
    !LOCALES.includes(source.locale_code as Locale)
  ) {
    fail("INVALID_ROW", `Unsupported locale "${String(source.locale_code)}".`, {
      entityKey,
    });
  }

  if (
    typeof source.sort_order !== "number" ||
    !Number.isInteger(source.sort_order) ||
    source.sort_order < 0
  ) {
    fail("INVALID_ROW", `Invalid sort_order for "${entityKey}".`, {
      entityKey,
    });
  }

  if (
    typeof source.schema_version !== "number" ||
    !Number.isInteger(source.schema_version) ||
    source.schema_version !== SCHEMA_VERSION
  ) {
    fail(
      "INVALID_SCHEMA_VERSION",
      `Unsupported schema version for "${entityKey}".`,
      { entityKey, locale: source.locale_code as Locale },
    );
  }

  return {
    entity_id: entityId,
    entity_type: source.entity_type as EntityType,
    entity_key: entityKey,
    sort_order: source.sort_order,
    locale_code: source.locale_code as Locale,
    schema_version: source.schema_version,
    payload: object(source.payload, `${entityKey}.${source.locale_code}.payload`),
  };
}

function groupRows(rows: readonly unknown[]): Map<EntityType, EntityGroup[]> {
  if (!Array.isArray(rows) || rows.length === 0) {
    fail("INVALID_ROWS", "Published portfolio content is empty or invalid.");
  }

  const groups = new Map<string, EntityGroup>();
  const ids = new Set<string>();

  for (const value of rows) {
    const row = parseRow(value);
    const groupId = `${row.entity_type}:${row.entity_key}`;
    let group = groups.get(groupId);

    if (!group) {
      if (ids.has(row.entity_id)) {
        fail(
          "DUPLICATE_ENTITY_ID",
          `Entity ID "${row.entity_id}" is assigned to multiple entities.`,
          { entityKey: row.entity_key },
        );
      }
      ids.add(row.entity_id);

      group = {
        entityId: row.entity_id,
        type: row.entity_type,
        key: row.entity_key,
        sortOrder: row.sort_order,
        rows: new Map(),
      };
      groups.set(groupId, group);
    } else if (
      group.entityId !== row.entity_id ||
      group.sortOrder !== row.sort_order
    ) {
      fail(
        "INVALID_ROW",
        `Inconsistent identity or sort order for "${row.entity_key}".`,
        { entityKey: row.entity_key },
      );
    }

    if (group.rows.has(row.locale_code)) {
      fail(
        "DUPLICATE_LOCALE",
        `Duplicate ${row.locale_code} row for "${row.entity_key}".`,
        { entityKey: row.entity_key, locale: row.locale_code },
      );
    }

    group.rows.set(row.locale_code, row);
  }

  const result = new Map<EntityType, EntityGroup[]>();
  for (const group of groups.values()) {
    for (const locale of LOCALES) {
      if (!group.rows.has(locale)) {
        fail(
          "MISSING_LOCALE",
          `Missing ${locale} row for "${group.key}".`,
          { entityKey: group.key, locale },
        );
      }
    }

    const list = result.get(group.type) ?? [];
    list.push(group);
    result.set(group.type, list);
  }

  for (const list of result.values()) {
    list.sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.key.localeCompare(b.key),
    );
  }

  return result;
}

function singleton(
  groups: Map<EntityType, EntityGroup[]>,
  type: "profile" | "summary",
  key: string,
): EntityGroup {
  const matches = groups.get(type) ?? [];
  if (matches.length === 0) {
    fail("MISSING_ENTITY", `Missing required ${type} entity.`);
  }
  if (matches.length !== 1 || matches[0].key !== key) {
    fail("DUPLICATE_SINGLETON", `Expected exactly one "${key}" ${type} entity.`);
  }
  return matches[0];
}

function mapProfile(group: EntityGroup): Profile {
  const shared = sharedObject(group);
  const socials = object(shared.socials, "profile.und.socials");

  return {
    name: localizedText(group, "name"),
    title: localizedText(group, "title"),
    email: requiredString(shared.email, "profile.und.email"),
    linkedinHandle: requiredString(
      shared.linkedinHandle,
      "profile.und.linkedinHandle",
    ),
    socials: {
      LinkedIn: optionalEmptyString(socials.LinkedIn, "profile.und.socials.LinkedIn"),
      Dribbble: optionalEmptyString(socials.Dribbble, "profile.und.socials.Dribbble"),
      Website: optionalEmptyString(socials.Website, "profile.und.socials.Website"),
    },
    phone: optionalEmptyString(shared.phone, "profile.und.phone"),
  };
}

function mapProject(group: EntityGroup): Project {
  const shared = sharedObject(group);
  const caseStudy = mapProjectCaseStudy(group);

  const project: Project = {
    id: group.key,
    name: requiredString(shared.name, `${group.key}.und.name`),
    category: localizedText(group, "category"),
    sector: localizedText(group, "sector"),
    device: deviceType(shared.device, `${group.key}.und.device`),
    ...caseStudy,
  };

  const image = optionalString(shared.image, `${group.key}.und.image`);
  const secondaryImage = optionalString(
    shared.secondaryImage,
    `${group.key}.und.secondaryImage`,
  );

  if (image !== undefined) project.image = image;
  if (secondaryImage !== undefined) project.secondaryImage = secondaryImage;

  const alt = LOCALIZED_LOCALES.map((locale) =>
    optionalString(
      payload(group, locale).imageAlt,
      `${group.key}.${locale}.imageAlt`,
    ),
  );

  if (alt.some((value) => value !== undefined)) {
    if (alt.some((value) => value === undefined)) {
      fail("INVALID_PAYLOAD", `Project "${group.key}" imageAlt must exist in all locales.`);
    }
    project.imageAlt = alt as Text;
  }

  return project;
}

function mapExperience(group: EntityGroup): Experience {

  return {
    company: requiredString(
      sharedObject(group).company,
      `${group.key}.und.company`,
    ),
    role: localizedText(group, "role"),
    dates: localizedText(group, "dates"),
    bullets: localizedStringArray(group, "bullets"),
  };
}

function mapMetric(group: EntityGroup): Metric {

  const shared = sharedObject(group);
  return {
    value: requiredString(shared.value, `${group.key}.und.value`),
    company: requiredString(shared.company, `${group.key}.und.company`),
    label: localizedText(group, "label"),
    detail: localizedText(group, "detail"),
  };
}

function mapCapability(group: EntityGroup): Capability {
  assertEmptyUnd(group);
  return {
    title: localizedText(group, "title"),
    skills: localizedStringArray(group, "skills"),
  };
}

function mapService(group: EntityGroup): Service {
  assertEmptyUnd(group);
  return {
    title: localizedText(group, "title"),
    description: localizedText(group, "description"),
  };
}

function mapCertification(group: EntityGroup): Certification {
  assertEmptyUnd(group);
  return {
    title: localizedText(group, "title"),
    issuer: localizedText(group, "issuer"),
    date: localizedText(group, "date"),
  };
}

export function decodePortfolioContent(
  rows: readonly unknown[],
): PortfolioContent {
  const groups = groupRows(rows);

  const profile = mapProfile(singleton(groups, "profile", "profile"));
  const summaryGroup = singleton(groups, "summary", "summary");
  assertEmptyUnd(summaryGroup);

  return {
    profile,
    summary: localizedText(summaryGroup, "value"),
    projects: (groups.get("project") ?? []).map(mapProject),
    experiences: (groups.get("experience") ?? []).map(mapExperience),
    metrics: (groups.get("metric") ?? []).map(mapMetric),
    capabilities: (groups.get("capability") ?? []).map(mapCapability),
    services: (groups.get("service") ?? []).map(mapService),
    certifications: (groups.get("certification") ?? []).map(mapCertification),
  };
}
