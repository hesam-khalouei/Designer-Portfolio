import { useLanguage } from "../app/providers/LanguageProvider";
import { text } from "../domain/localization/LocalizedText";
import { ui } from "../locales";

export default function AdminApp() {
  const { lang } = useLanguage();

  return (
    <main className="container" style={{ minHeight: "100vh", paddingBlock: "6rem" }}>
      <section aria-labelledby="admin-title">
        <p className="eyebrow">Portfolio</p>
        <h1 id="admin-title">{text(ui.adminTitle, lang)}</h1>
        <p>{text(ui.adminDescription, lang)}</p>
        <a href="#/">{text(ui.adminBack, lang)}</a>
      </section>
    </main>
  );
}
