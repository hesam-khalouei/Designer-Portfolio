import { useEffect, useState } from "react";
import { useHashRoute } from "./app/routing/useHashRoute";
import { useLanguage } from "./app/providers/LanguageProvider";
import type { AppDependencies } from "./app/bootstrap/createAppDependencies";
import { text } from "./domain/localization/LocalizedText";
import type { PortfolioContent } from "./domain/content/entities/PortfolioContent";
import { ui } from "./locales";
import AdminApp from "./admin/AdminApp";
import { AdminAuthProvider } from "./admin/auth/AdminAuthProvider";
import { AdminAuthGate } from "./admin/auth/AdminAuthGate";
import PublicApp from "./public-site/PublicApp";

export default function App({ dependencies }: { dependencies: AppDependencies }) {
  const route = useHashRoute();

  return route === "#/admin" ? (
    <AdminAuthProvider repository={dependencies.adminAuthRepository}><AdminAuthGate><AdminApp /></AdminAuthGate></AdminAuthProvider>
  ) : (
    <PublicRoute
      route={route}
      getPortfolioContent={dependencies.getPortfolioContent}
    />
  );
}

function PublicRoute({
  route,
  getPortfolioContent,
}: {
  route: string;
  getPortfolioContent: AppDependencies["getPortfolioContent"];
}) {
  const { lang } = useLanguage();

  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(false);

    Promise.resolve()
      .then(() => getPortfolioContent.execute())
      .then((result) => {
        if (active) {
          setContent(result);
        }
      })
      .catch(() => {
        if (active) {
          setContent(null);
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [getPortfolioContent, attempt]);

  if (loading) {
    return (
      <main role="status" aria-live="polite">
        {text(ui.portfolioLoading, lang)}
      </main>
    );
  }

  if (error || !content) {
    return (
      <main role="alert">
        <p>{text(ui.portfolioLoadError, lang)}</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          {text(ui.retry, lang)}
        </button>
      </main>
    );
  }

  return <PublicApp route={route} content={content} />;
}
