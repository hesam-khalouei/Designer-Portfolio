import { useCallback, useEffect, useState } from "react";
import type { AppDependencies } from "../../app/bootstrap/createAppDependencies";
import type { ProjectDraftListItem } from "../../domain/content/entities/ProjectDraft";
import { text } from "../../domain/localization/LocalizedText";
import { ui } from "../../locales";
import { AdminBadge } from "../design-system/AdminBadge";
import { AdminButton } from "../design-system/AdminButton";
import { AdminCard } from "../design-system/AdminCard";
import { AdminSectionHeading } from "../design-system/AdminSectionHeading";
import { AdminProjectEditor } from "./AdminProjectEditor";
import { AdminProjectCreateForm } from "./AdminProjectCreateForm";

type Props = {
  projectDrafts: Pick<AppDependencies["projectDrafts"], "list" | "get" | "save" | "create">;
  locale: "en" | "fa" | "ar";
};

export function AdminProjectList({ projectDrafts, locale }: Props) {
  const [projects, setProjects] = useState<ProjectDraftListItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const result = await projectDrafts.list.execute(locale);
      setProjects(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [projectDrafts, locale]);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(false);

    projectDrafts.list.execute(locale).then(
      (result) => {
        if (active) setProjects(result);
      },
      () => {
        if (active) setError(true);
      },
    ).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [projectDrafts, locale]);

  return (
    <section className="admin-projects" aria-labelledby="admin-projects-title">
      <div className="admin-projects-heading">
        <AdminSectionHeading
          title={text(ui.adminProjectsTitle, locale)}
          description={text(ui.adminProjectsDescription, locale)}
        />
        <AdminBadge tone="neutral">
          {projects.length} {text(ui.adminProjectsCount, locale)}
        </AdminBadge>
      </div>

      <AdminProjectCreateForm projectDrafts={projectDrafts} locale={locale} onCreated={loadProjects} />

      {loading && (
        <AdminCard className="admin-projects-state" aria-live="polite">
          <p>{text(ui.adminProjectsLoading, locale)}</p>
        </AdminCard>
      )}

      {!loading && error && (
        <AdminCard className="admin-projects-state" role="alert">
          <p>{text(ui.adminProjectsError, locale)}</p>
          <AdminButton variant="secondary" onClick={loadProjects}>
            {text(ui.retry, locale)}
          </AdminButton>
        </AdminCard>
      )}

      {!loading && !error && projects.length === 0 && (
        <AdminCard className="admin-projects-state">
          <p>{text(ui.adminProjectsEmpty, locale)}</p>
        </AdminCard>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="admin-projects-list">
          {projects.map((project) => (
            <AdminCard className="admin-project-row" key={project.projectId}>
              <div className="admin-project-info">
                <strong>{project.name}</strong>
                <span>{project.projectId}</span>
              </div>

              <div className="admin-project-meta">
                <span>{text(ui.adminProjectDevice, locale)}: {project.device}</span>
                <span>{text(ui.adminProjectOrder, locale)}: {project.sortOrder}</span>
              </div>

              <div className="admin-project-status">
                <AdminBadge tone={project.hasDraft ? "success" : "warning"}>
                  {project.hasDraft
                    ? text(ui.adminProjectHasDraft, locale)
                    : text(ui.adminProjectMissingDraft, locale)}
                </AdminBadge>
                <span>
                  {text(ui.adminProjectRevision, locale)}: {project.revision ?? "—"}
                </span>
              </div>

              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSelectedProjectId((current) =>
                    current === project.projectId ? null : project.projectId
                  )
                }
                aria-expanded={selectedProjectId === project.projectId}
              >
                {selectedProjectId === project.projectId
                  ? locale === "fa" ? "بستن ویرایشگر" : locale === "ar" ? "إغلاق المحرر" : "Close editor"
                  : locale === "fa" ? "ویرایش" : locale === "ar" ? "تعديل" : "Edit"}
              </AdminButton>
            </AdminCard>
          ))}
        </div>
      )}

      {selectedProjectId && (
        <AdminProjectEditor
          projectId={selectedProjectId}
          projectDrafts={projectDrafts}
          locale={locale}
        />
      )}
    </section>
  );
}
