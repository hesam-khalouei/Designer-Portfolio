import { useCallback, useEffect, useState } from "react";
import type { AppDependencies } from "../../app/bootstrap/createAppDependencies";
import type {
  ProjectDraftSharedData,
  ProjectDraftLocalizedData,
} from "../../domain/content/entities/ProjectDraft";
import type { DeviceType } from "../../domain/content/entities/PortfolioContent";
import type { Lang } from "../../domain/localization/LocalizedText";
import { ProjectDraftError } from "../../application/errors/ProjectDraftError";
import { AdminButton } from "../design-system/AdminButton";
import { AdminCard } from "../design-system/AdminCard";
import { AdminInput } from "../design-system/AdminInput";

type Props = {
  projectId: string;
  projectDrafts: Pick<AppDependencies["projectDrafts"], "get" | "save">;
  locale: Lang;
};

const devices: DeviceType[] = [
  "phone", "laptop", "tablet", "browser", "monitor", "multi",
];

const labels: Record<Lang, Record<string, string>> = {
  en: {
    title: "Edit project",
    name: "Project name",
    device: "Device",
    category: "Category",
    sector: "Sector",
    contentLanguage: "Content language",
    sharedSave: "Save shared information",
    localizedSave: "Save translation",
    loading: "Loading project...",
    loadError: "Could not load project.",
    saveSuccess: "Changes saved successfully.",
    saveError: "Could not save changes.",
    conflict: "This project changed elsewhere. Reload before saving.",
    reload: "Reload project",
    shared: "Shared information",
    translation: "Localized information",
    unsaved: "You have unsaved changes. Discard them and switch language?",
  },
  fa: {
    title: "ویرایش پروژه",
    name: "نام پروژه",
    device: "دستگاه",
    category: "دسته‌بندی",
    sector: "حوزه فعالیت",
    contentLanguage: "زبان محتوا",
    sharedSave: "ذخیره اطلاعات مشترک",
    localizedSave: "ذخیره ترجمه",
    loading: "در حال بارگذاری پروژه...",
    loadError: "بارگذاری پروژه ناموفق بود.",
    saveSuccess: "تغییرات با موفقیت ذخیره شد.",
    saveError: "ذخیره تغییرات ناموفق بود.",
    conflict: "این پروژه در جای دیگری تغییر کرده است. ابتدا اطلاعات را دوباره بارگذاری کن.",
    reload: "بارگذاری مجدد پروژه",
    shared: "اطلاعات مشترک",
    translation: "اطلاعات ترجمه‌شده",
    unsaved: "تغییرات ذخیره‌نشده داری. از آن‌ها صرف‌نظر می‌کنی و زبان را تغییر می‌دهی؟",
  },
  ar: {
    title: "تعديل المشروع",
    name: "اسم المشروع",
    device: "الجهاز",
    category: "الفئة",
    sector: "مجال العمل",
    contentLanguage: "لغة المحتوى",
    sharedSave: "حفظ المعلومات المشتركة",
    localizedSave: "حفظ الترجمة",
    loading: "جارٍ تحميل المشروع...",
    loadError: "تعذر تحميل المشروع.",
    saveSuccess: "تم حفظ التغييرات بنجاح.",
    saveError: "تعذر حفظ التغييرات.",
    conflict: "تم تغيير المشروع في مكان آخر. أعد تحميل البيانات قبل الحفظ.",
    reload: "إعادة تحميل المشروع",
    shared: "المعلومات المشتركة",
    translation: "المعلومات المترجمة",
    unsaved: "لديك تغييرات غير محفوظة. هل تريد تجاهلها وتغيير اللغة؟",
  },
};

export function AdminProjectEditor({
  projectId,
  projectDrafts,
  locale,
}: Props) {
  const t = labels[locale];

  const [contentLocale, setContentLocale] = useState<Lang>(locale);
  const [initialLocaleResolved, setInitialLocaleResolved] = useState(false);
  const [shared, setShared] = useState<ProjectDraftSharedData | null>(null);
  const [localized, setLocalized] = useState<ProjectDraftLocalizedData>({});
  const [sharedRevision, setSharedRevision] = useState<number | null>(null);
  const [localeRevision, setLocaleRevision] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingShared, setSavingShared] = useState(false);
  const [savingLocalized, setSavingLocalized] = useState(false);
  const [localizedDirty, setLocalizedDirty] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const sharedDraft = await projectDrafts.get.execute(projectId, "und");

      if (!sharedDraft) {
        throw new Error("Shared project draft not found.");
      }

      let languageDraft = await projectDrafts.get.execute(projectId, contentLocale);

      if (!initialLocaleResolved && (!languageDraft || languageDraft.revision === null)) {
        for (const candidate of ["en", "fa", "ar"] as const) {
          if (candidate === contentLocale) continue;
          const candidateDraft = await projectDrafts.get.execute(projectId, candidate);
          if (candidateDraft && candidateDraft.revision !== null) {
            languageDraft = candidateDraft;
            setContentLocale(candidate);
            break;
          }
        }
      }

      setInitialLocaleResolved(true);

      setShared(sharedDraft.shared);
      setSharedRevision(sharedDraft.revision);
      setLocalized(languageDraft?.localized ?? {});
      setLocaleRevision(languageDraft?.revision ?? null);
      setLocalizedDirty(false);
    } catch {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [projectDrafts, projectId, contentLocale, t.loadError]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);



  function changeContentLocale(nextLocale: Lang) {
    if (nextLocale === contentLocale) return;

    if (localizedDirty && !window.confirm(t.unsaved)) {
      return;
    }

    setLocalizedDirty(false);
    setContentLocale(nextLocale);
  }

  async function saveShared() {
    if (!shared || savingShared) return;

    setSavingShared(true);
    setError("");
    setNotice("");

    try {
      const saved = await projectDrafts.save.execute({
        projectId,
        locale: "und",
        expectedRevision: sharedRevision,
        shared,
      });

      setShared(saved.shared);
      setSharedRevision(saved.revision);
      setNotice(t.saveSuccess);
    } catch (cause) {
      setError(
        cause instanceof ProjectDraftError && cause.code === "REVISION_CONFLICT"
          ? t.conflict
          : t.saveError,
      );
    } finally {
      setSavingShared(false);
    }
  }

  async function saveLocalized() {
    if (savingLocalized || !localizedDirty) return;

    setSavingLocalized(true);
    setError("");
    setNotice("");

    try {
      const saved = await projectDrafts.save.execute({
        projectId,
        locale: contentLocale,
        expectedRevision: localeRevision,
        localized,
      });

      setLocalized(saved.localized);
      setLocaleRevision(saved.revision);
      setLocalizedDirty(false);
      setNotice(t.saveSuccess);
    } catch (cause) {
      setError(
        cause instanceof ProjectDraftError && cause.code === "REVISION_CONFLICT"
          ? t.conflict
          : t.saveError,
      );
    } finally {
      setSavingLocalized(false);
    }
  }

  function reloadWithConfirmation() {
    if (localizedDirty && !window.confirm(t.unsaved)) return;
    void loadProject();
  }

  return (
    <section className="admin-project-editor">
      <h3>{t.title}: {projectId}</h3>

      {loading && (
        <AdminCard>
          <p>{t.loading}</p>
        </AdminCard>
      )}

      {!loading && error && !shared && (
        <AdminCard role="alert">
          <p>{error}</p>
          <AdminButton variant="secondary" onClick={reloadWithConfirmation}>
            {t.reload}
          </AdminButton>
        </AdminCard>
      )}

      {!loading && shared && (
        <>
          <AdminCard className="admin-editor-card">
            <h4>{t.shared}</h4>

            <AdminInput
              id={`project-name-${projectId}`}
              label={t.name}
              value={shared.name}
              onChange={(event) =>
                setShared({ ...shared, name: event.target.value })
              }
            />

            <div className="admin-field">
              <label className="admin-field-label" htmlFor={`project-device-${projectId}`}>
                {t.device}
              </label>
              <select
                id={`project-device-${projectId}`}
                className="admin-input"
                value={shared.device}
                onChange={(event) =>
                  setShared({
                    ...shared,
                    device: event.target.value as DeviceType,
                  })
                }
              >
                {devices.map((device) => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>

            <AdminButton onClick={saveShared} disabled={savingShared}>
              {savingShared ? "..." : t.sharedSave}
            </AdminButton>
          </AdminCard>

          <AdminCard className="admin-editor-card">
            <h4>{t.translation}</h4>

            <div className="admin-field">
              <label
                className="admin-field-label"
                htmlFor={`project-content-language-${projectId}`}
              >
                {t.contentLanguage}
              </label>
              <select
                id={`project-content-language-${projectId}`}
                className="admin-input"
                value={contentLocale}
                onChange={(event) =>
                  changeContentLocale(event.target.value as Lang)
                }
              >
                <option value="en">English</option>
                <option value="fa">فارسی</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            <AdminInput
              id={`project-category-${projectId}`}
              label={t.category}
              value={localized.category ?? ""}
              onChange={(event) => {
                setLocalized({ ...localized, category: event.target.value });
                setLocalizedDirty(true);
              }}
            />

            <AdminInput
              id={`project-sector-${projectId}`}
              label={t.sector}
              value={localized.sector ?? ""}
              onChange={(event) => {
                setLocalized({ ...localized, sector: event.target.value });
                setLocalizedDirty(true);
              }}
            />

            <AdminButton
              onClick={saveLocalized}
              disabled={savingLocalized || !localizedDirty}
            >
              {savingLocalized ? "..." : t.localizedSave}
            </AdminButton>
          </AdminCard>

          {notice && <p role="status">{notice}</p>}
          {error && <p role="alert">{error}</p>}

          <AdminButton variant="secondary" onClick={reloadWithConfirmation}>
            {t.reload}
          </AdminButton>
        </>
      )}
    </section>
  );
}
