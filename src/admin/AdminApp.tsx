import type { AppDependencies } from '../app/bootstrap/createAppDependencies';
import { useLanguage } from '../app/providers/LanguageProvider';
import { useTheme } from '../app/providers/ThemeProvider';
import { text, type Lang } from '../domain/localization/LocalizedText';
import { ui } from '../locales';
import { AdminProjectList } from './content/AdminProjectList';
import { AdminLegacyProjectImporter } from './content/AdminLegacyProjectImporter';
import './styles/admin-tokens.css';
import './styles/admin.css';

export default function AdminApp({
  projectDrafts,
}: Pick<AppDependencies, 'projectDrafts'>) {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div className="admin-app">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            Portfolio
            <span>Administration</span>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-header">
            <div className="admin-header-title">
              {text(ui.adminTitle, lang)}
            </div>

            <div className="admin-header-actions">
              <label className="admin-visually-hidden" htmlFor="admin-language">
                {text(ui.langLabel, lang)}
              </label>

              <select
                id="admin-language"
                className="admin-control"
                value={lang}
                onChange={(event) => setLang(event.target.value as Lang)}
              >
                <option value="en">English</option>
                <option value="fa">فارسی</option>
                <option value="ar">العربية</option>
              </select>

              <button
                type="button"
                className="admin-control"
                onClick={() => setTheme(nextTheme)}
                aria-label={text(ui[nextTheme], lang)}
              >
                {text(ui[nextTheme], lang)}
              </button>
            </div>
          </header>

          <main className="admin-content">
            <section
              className="admin-page-heading"
              aria-labelledby="admin-title"
            >
              <h1 id="admin-title">{text(ui.adminTitle, lang)}</h1>
              <p>{text(ui.adminDescription, lang)}</p>
            </section>

            <AdminLegacyProjectImporter
              projectDrafts={projectDrafts}
              locale={lang}
            />

            <AdminProjectList projectDrafts={projectDrafts} locale={lang} />

            <p className="admin-back-link">
              <a className="admin-control" href="#/">
                {text(ui.adminBack, lang)}
              </a>
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
