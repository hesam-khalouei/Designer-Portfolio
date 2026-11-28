import { useState } from 'react';
import type { AppDependencies } from '../../app/bootstrap/createAppDependencies';
import type { Lang } from '../../domain/localization/LocalizedText';
import type {
  ProjectDraftLocalizedData,
  ProjectDraftSharedData,
} from '../../domain/content/entities/ProjectDraft';
import { projects } from '../../content';
import { AdminButton } from '../design-system/AdminButton';
import { AdminCard } from '../design-system/AdminCard';

type Props = {
  projectDrafts: Pick<
    AppDependencies['projectDrafts'],
    'get' | 'create' | 'save'
  >;
  locale: Lang;
};

const locales: Lang[] = ['en', 'fa', 'ar'];

const localeLabels: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Legacy Project Import',
    description: 'Import the existing portfolio projects into the CMS.',
    start: 'Start import',
    running: 'Importing...',
    completed: 'Import completed',
    progress: 'Progress',
    created: 'Projects created',
    saved: 'Translations saved',
    skipped: 'Existing translations skipped',
    errors: 'Errors',
    failed: 'Import finished with errors. You can safely retry.',
    success: 'All projects were processed successfully.',
  },
  fa: {
    title: 'انتقال پروژه‌های قبلی',
    description: 'انتقال پروژه‌های فعلی پورتفولیو به CMS.',
    start: 'شروع انتقال',
    running: 'در حال انتقال...',
    completed: 'انتقال پایان یافت',
    progress: 'پیشرفت',
    created: 'پروژه‌های ایجادشده',
    saved: 'ترجمه‌های ذخیره‌شده',
    skipped: 'ترجمه‌های قبلی حفظ‌شده',
    errors: 'خطاها',
    failed: 'انتقال با خطا پایان یافت. می‌توانی با خیال راحت دوباره تلاش کنی.',
    success: 'تمام پروژه‌ها با موفقیت بررسی شدند.',
  },
  ar: {
    title: 'نقل المشاريع السابقة',
    description: 'نقل مشاريع المحفظة الحالية إلى نظام إدارة المحتوى.',
    start: 'بدء النقل',
    running: 'جارٍ النقل...',
    completed: 'اكتمل النقل',
    progress: 'التقدم',
    created: 'المشاريع المنشأة',
    saved: 'الترجمات المحفوظة',
    skipped: 'الترجمات الموجودة التي تم الاحتفاظ بها',
    errors: 'الأخطاء',
    failed: 'انتهى النقل مع وجود أخطاء. يمكنك إعادة المحاولة بأمان.',
    success: 'تمت معالجة جميع المشاريع بنجاح.',
  },
};

function localizedPayload(
  project: (typeof projects)[number],
  locale: Lang,
): ProjectDraftLocalizedData {
  const index = locales.indexOf(locale);

  return {
    category: project.category[index],
    sector: project.sector[index],
  };
}

function sharedPayload(
  project: (typeof projects)[number],
): ProjectDraftSharedData {
  return {
    name: project.name,
    device: project.device,
  };
}

export function AdminLegacyProjectImporter({ projectDrafts, locale }: Props) {
  const labels = localeLabels[locale];

  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [created, setCreated] = useState(0);
  const [saved, setSaved] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  async function runImport() {
    if (running) return;

    setRunning(true);
    setFinished(false);
    setProcessed(0);
    setCreated(0);
    setSaved(0);
    setSkipped(0);
    setErrors([]);

    let createdCount = 0;
    let savedCount = 0;
    let skippedCount = 0;
    const failedProjects: string[] = [];

    try {
      for (let index = 0; index < projects.length; index += 1) {
        const project = projects[index];

        try {
          let existing = await projectDrafts.get.execute(project.id, 'en');

          if (!existing) {
            await projectDrafts.create.execute({
              projectId: project.id,
              initialLocale: 'en',
              sortOrder: index,
              shared: sharedPayload(project),
              localized: localizedPayload(project, 'en'),
            });

            createdCount += 1;
          } else if (existing.sharedRevision === null) {
            await projectDrafts.save.execute({
              projectId: project.id,
              locale: 'und',
              expectedRevision: null,
              shared: sharedPayload(project),
              sortOrder: index,
            });
          }

          for (const language of locales) {
            const draft = await projectDrafts.get.execute(project.id, language);

            if (!draft) {
              throw new Error(
                `Could not read ${language} draft after project creation.`,
              );
            }

            if (draft.revision !== null) {
              skippedCount += 1;
              continue;
            }

            await projectDrafts.save.execute({
              projectId: project.id,
              locale: language,
              expectedRevision: null,
              localized: localizedPayload(project, language),
            });

            savedCount += 1;
          }
        } catch (error) {
          failedProjects.push(
            `${project.id}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        }

        setProcessed(index + 1);
        setCreated(createdCount);
        setSaved(savedCount);
        setSkipped(skippedCount);
        setErrors([...failedProjects]);
      }
    } finally {
      setRunning(false);
      setFinished(true);
    }
  }

  return (
    <section className="admin-legacy-importer">
      <AdminCard>
        <h2>{labels.title}</h2>
        <p>{labels.description}</p>

        <p>
          {labels.progress}: {processed} / {projects.length}
        </p>

        <progress
          value={processed}
          max={projects.length}
          aria-label={labels.progress}
          style={{ width: '100%' }}
        />

        <p>
          {labels.created}: {created}
        </p>
        <p>
          {labels.saved}: {saved}
        </p>
        <p>
          {labels.skipped}: {skipped}
        </p>

        <AdminButton onClick={runImport} disabled={running}>
          {running ? labels.running : labels.start}
        </AdminButton>

        {finished && (
          <p role="status">
            {errors.length > 0 ? labels.failed : labels.success}
          </p>
        )}

        {errors.length > 0 && (
          <div role="alert">
            <h3>{labels.errors}</h3>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </AdminCard>
    </section>
  );
}
