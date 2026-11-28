import type { Lang } from "../../localization/LocalizedText";
import type { DeviceType, ProjectVisual } from "./PortfolioContent";

export type ProjectDraftLocale = Lang | "und";

export interface ProjectDraftSharedData {
  name: string;
  device: DeviceType;
  image?: string;
  secondaryImage?: string;
  caseMedia?: Partial<Record<number, Omit<ProjectVisual, "imageAlt">>>;
}

export interface ProjectDraftLocalizedData {
  category?: string;
  sector?: string;
  imageAlt?: string;
  caseContent?: Partial<Record<number, string>>;
  caseMediaAlt?: Partial<Record<number, string>>;
}

export interface ProjectDraft {
  projectId: string;
  locale: ProjectDraftLocale;
  /** Revision of the requested locale, or the shared revision when locale is und. */
  revision: number | null;
  /** Latest shared-data revision from the und publication unit. */
  sharedRevision: number | null;
  sortOrder: number;
  shared: ProjectDraftSharedData;
  localized: ProjectDraftLocalizedData;
}

export interface ProjectDraftListItem {
  projectId: string;
  name: string;
  device: DeviceType;
  sortOrder: number;
  /** Revision of the requested locale. */
  revision: number | null;
  /** Revision of the shared und draft. */
  sharedRevision: number | null;
  hasDraft: boolean;
}

export interface CreateProjectDraftInput {
  projectId: string;
  initialLocale: Lang;
  sortOrder?: number;
  shared: ProjectDraftSharedData;
  localized?: ProjectDraftLocalizedData;
}

export type SaveProjectDraftInput =
  | {
      projectId: string;
      locale: "und";
      expectedRevision: number | null;
      shared: ProjectDraftSharedData;
      sortOrder?: number;
    }
  | {
      projectId: string;
      locale: Lang;
      expectedRevision: number | null;
      localized: ProjectDraftLocalizedData;
    };
