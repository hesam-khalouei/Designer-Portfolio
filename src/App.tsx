import { useEffect, useState } from "react";
import {
  capabilities,
  certifications,
  experiences,
  metrics,
  profile,
  projects,
  services,
  summary,
  text,
  type Lang,
  type Project,
} from "./content";
import { caseSections, ui, type UIKey } from "./locales";
import {
  Icon,
  LanguageControl,
  MetricNumber,
  ProjectCard,
  ProjectMedia,
  stagger,
  useReveals,
} from "./components";

const saved = (key: string, fallback: string) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};
const persist = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Preferences remain usable when storage is disabled. */
  }
};
const nav: [string, UIKey][] = [
  ["work", "navWork"],
  ["experience", "navExperience"],
  ["about", "navAbout"],
  ["services", "navServices"],
];

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const l = saved("ahk-language", "en");
    return l === "fa" || l === "ar" ? l : "en";
  });
  const [theme, setTheme] = useState(() =>
    saved("ahk-theme", "light") === "dark" ? "dark" : "light",
  );
  const [menu, setMenu] = useState(false);
  const [route, setRoute] = useState(window.location.hash);
  const [more, setMore] = useState(false);
  const t = (key: UIKey) => text(ui[key], lang);
  const project = route.startsWith("#/work/")
    ? projects.find((p) => p.id === route.slice(7))
    : undefined;
  useReveals(`${project?.id || "home"}-${more}`);
  useEffect(() => {
    const handler = () => {
      setRoute(window.location.hash);
      setMenu(false);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    if (project || !route || route === "#top") window.scrollTo({ top: 0, behavior: "instant" });
    else if (!route.startsWith("#/"))
      requestAnimationFrame(() => document.getElementById(route.slice(1))?.scrollIntoView());
  }, [route, project]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document
      .getElementById("main")
      ?.animate([{ opacity: 0.65 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
  }, [lang, project?.id]);
  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu(false);
      document.querySelector<HTMLButtonElement>(".mobile-toggle")?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menu]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    persist("ahk-language", lang);
    document.title = `${project ? `${project.name} — ` : ""}${text(profile.name, lang)} — ${text(profile.title, lang)}`;
    const description = text(summary, lang);
    const updateMeta = (attr: string, key: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, key);
        document.head.append(element);
      }
      element.content = content;
    };
    updateMeta("name", "description", description);
    updateMeta("property", "og:title", document.title);
    updateMeta("property", "og:description", description);
    updateMeta(
      "property",
      "og:image:alt",
      `${text(profile.name, lang)} — ${text(profile.title, lang)}`,
    );
    updateMeta("name", "twitter:title", document.title);
    updateMeta("name", "twitter:description", description);
    updateMeta(
      "property",
      "og:locale",
      lang === "en" ? "en_US" : lang === "fa" ? "fa_IR" : "ar_SA",
    );
  }, [lang, project]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    persist("ahk-theme", theme);
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta)
      meta.content = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-background")
        .trim();
  }, [theme]);
  const language = <LanguageControl lang={lang} onChange={setLang} />;
  const socials = Object.entries(profile.socials).filter(([, url]) => /^https?:\/\//.test(url));

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main");
          main?.focus({ preventScroll: true });
          main?.scrollIntoView();
        }}
      >
        {t("skip")}
      </a>
      <header className="header">
        <div className="header-inner">
          <a className="wordmark" href="#top" aria-label={text(profile.name, lang)} dir="ltr">
            ahk<span>.</span>
          </a>
          <nav className="desktop-nav" aria-label={t("menu")}>
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {t(label)}
              </a>
            ))}
          </nav>
          <div className="header-controls">
            {language}
            <span className="control-divider" />
            <button
              className="theme-control"
              title={t(theme === "light" ? "dark" : "light")}
              aria-label={t(theme === "light" ? "dark" : "light")}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Icon name={theme === "light" ? "sun" : "moon"} />
            </button>
            <a className="header-contact" href="#contact">
              {t("navContact")}
              <Icon />
            </a>
            <button
              className="mobile-toggle"
              onClick={() => setMenu(!menu)}
              aria-expanded={menu}
              aria-controls="mobile-nav"
              aria-label={t(menu ? "closeMenu" : "menu")}
            >
              <Icon name={menu ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {menu && (
          <nav id="mobile-nav" className="mobile-nav">
            {[...nav, ["contact", "navContact"] as [string, UIKey]].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
                {t(label)}
                <Icon />
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="main" tabIndex={-1}>
        {project ? (
          <CaseStudy project={project} lang={lang} />
        ) : (
          <>
            <section className="hero container" id="top">
              <div className="hero-topline">
                <span className="eyebrow">
                  <span className="tiny-square" />
                  {text(profile.name, lang)}{" "}
                  <span className="hero-role">/ {text(profile.title, lang)}</span>
                </span>
                <span className="location">{t("location")}</span>
              </div>
              <div className="hero-layout">
                <div className="hero-copy">
                  <h1>
                    {t("heroOne")} <em>{t("heroAccent")}</em>
                    <br />
                    {t("heroTwo")}
                    <br />
                    {t("heroThree")}
                  </h1>
                  <p className="hero-intro">{text(summary, lang)}</p>
                  <div className="hero-actions">
                    <a href="#work" className="button button-primary">
                      {t("explore")}
                      <Icon name="down" />
                    </a>
                    <a href="#contact" className="text-button">
                      {t("discuss")}
                      <Icon />
                    </a>
                  </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="art-top">
                    <span>AHK — DESIGN</span>
                    <span>01 / ∞</span>
                  </div>
                  <div className="art-grid" />
                  <div className="monogram">
                    <span>a</span>
                    <span>h</span>
                    <span>k</span>
                    <i>.</i>
                  </div>
                  <div className="art-orbit" />
                  <div className="art-bottom">
                    <span>
                      {t("heroAccent")}
                      <br />
                      {t("heroThree")}
                    </span>
                    <Icon />
                  </div>
                  <div className="art-side">STRATEGY MEETS CRAFT</div>
                </div>
              </div>
              <div className="hero-bottom">
                <span className="disciplines">{t("disciplines")}</span>
                <div className="experience-badge">
                  <strong dir="ltr">
                    8<span>+</span>
                  </strong>
                  <span>{t("years")}</span>
                </div>
                <a href="#work" className="scroll-link">
                  {t("scroll")}
                  <Icon name="down" />
                </a>
              </div>
            </section>

            <section className="section work-section container" id="work">
              <SectionHeading
                n="01"
                label={t("selected")}
                title={<>{t("selectedDesc")}</>}
                description={t("workNote")}
              />
              <div className="work-grid">
                {projects.slice(0, 5).map((p, i) => (
                  <ProjectCard project={p} lang={lang} index={i} key={p.id} />
                ))}
                <div className="work-editorial reveal">
                  <span className="editorial-symbol" aria-hidden="true">
                    ↗
                  </span>
                  <span className="eyebrow">{t("mediaNote")}</span>
                  <p>{t("industries")}</p>
                  <span className="small-muted">{t("mediaSoon")}</span>
                </div>
              </div>
              <button className="more-button" aria-expanded={more} onClick={() => setMore(!more)}>
                {t(more ? "fewerProjects" : "allProjects")}
                <span>{more ? "−" : "+"}</span>
              </button>
              {more && (
                <div className="additional-projects">
                  {projects.slice(5).map((p) => (
                    <a key={p.id} href={`#/work/${p.id}`}>
                      <div>
                        <h3>{p.name}</h3>
                        <p>{text(p.category, lang)}</p>
                      </div>
                      <Icon />
                    </a>
                  ))}
                </div>
              )}
            </section>

            <section className="impact-section" id="impact">
              <div className="container">
                <SectionHeading
                  n="02"
                  label={t("impactKicker")}
                  title={
                    <>
                      {t("impact")}
                      <br />
                      <em>{t("impactAccent")}</em>
                    </>
                  }
                  description={t("impactDesc")}
                />
                <div className="metrics-grid">
                  {metrics.map((m, i) => (
                    <article
                      className="metric reveal"
                      style={stagger(i)}
                      key={`${m.company}${m.value}`}
                    >
                      <div className="metric-top">
                        <span className="eyebrow">{m.company}</span>
                        <span className="metric-dot" />
                      </div>
                      <MetricNumber value={m.value} />
                      <h3>{text(m.label, lang)}</h3>
                      <p>{text(m.detail, lang)}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="section container" id="experience">
              <SectionHeading
                n="03"
                label={t("navExperience")}
                title={t("experience")}
                description={t("experienceDesc")}
              />
              <div className="timeline">
                {experiences.map((e, i) => (
                  <details className="experience-row reveal" key={e.company} open={i < 2}>
                    <summary>
                      <div className="experience-company">
                        <span className="timeline-marker" />
                        <h3>{e.company === "Freelance" ? t("freelance") : e.company}</h3>
                        {i === 0 && <span className="current-dot" />}
                      </div>
                      <div className="experience-role">
                        <strong>{text(e.role, lang)}</strong>
                        <span>{text(e.dates, lang)}</span>
                      </div>
                      <span className="expand-icon">
                        <Icon name="plus" />
                      </span>
                    </summary>
                    <div className="experience-details">
                      <span className="eyebrow">{t("details")}</span>
                      <ul>
                        {e.bullets.map((b, j) => (
                          <li key={j}>{text(b, lang)}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <section className="about-section" id="about">
              <div className="container about-grid">
                <div className="about-aside reveal">
                  <span className="section-label">
                    <span>04 /</span> {t("navAbout")}
                  </span>
                  <div className="about-monogram" aria-hidden="true">
                    ahk<span>.</span>
                  </div>
                  <span className="location">{t("location")}</span>
                </div>
                <div className="about-content reveal">
                  <h2>
                    {t("aboutTitle")}
                    <br />
                    <em>{t("aboutAccent")}</em>
                  </h2>
                  <p>{text(summary, lang)}</p>
                  <p>{t("aboutExtra")}</p>
                  <span className="about-signature">{text(profile.name, lang)}</span>
                  <span className="small-muted">{text(profile.title, lang)}</span>
                </div>
              </div>
            </section>

            <section className="section container" id="capabilities">
              <SectionHeading n="05" label={t("capabilitiesKicker")} title={t("capabilities")} />
              <div className="capabilities-grid">
                {capabilities.map((c, i) => (
                  <article className="capability reveal" key={i}>
                    <span className="capability-number">0{i + 1}</span>
                    <h3>{text(c.title, lang)}</h3>
                    <ul>
                      {c.skills.map((s, j) => (
                        <li key={j}>{text(s, lang)}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="services-section" id="services">
              <div className="container">
                <SectionHeading
                  n="06"
                  label={t("navServices")}
                  title={
                    <>
                      {t("services")}
                      <br />
                      <em>{t("servicesAccent")}</em>
                    </>
                  }
                  description={t("servicesDesc")}
                />
                <div className="services-grid">
                  {services.map((s, i) => (
                    <article className="service reveal" key={i}>
                      <span className="service-number">0{i + 1}</span>
                      <div>
                        <h3>{text(s.title, lang)}</h3>
                        <p>{text(s.description, lang)}</p>
                      </div>
                      <Icon />
                    </article>
                  ))}
                </div>
                <div className="services-cta">
                  <div>
                    <span className="small-muted">{t("challenge")}</span>
                    <h3>{t("meaningful")}</h3>
                  </div>
                  <a className="button button-primary" href={`mailto:${profile.email}`}>
                    {t("discuss")}
                    <Icon />
                  </a>
                </div>
              </div>
            </section>

            <section className="education-section container">
              <div>
                <span className="section-label">{t("education")}</span>
                <h3>{t("university")}</h3>
                <p>{t("degree")}</p>
                <span className="small-muted">{t("educationDate")}</span>
              </div>
              <div>
                <span className="section-label">{t("certifications")}</span>
                <div className="certifications">
                  {certifications.map((c, i) => (
                    <div key={i}>
                      <h4>{text(c.title, lang)}</h4>
                      <p>
                        {text(c.issuer, lang)}
                        <span>{text(c.date, lang)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <section className="contact-section" id="contact">
          <div className="container">
            <span className="section-label">{t("contactKicker")}</span>
            <div className="contact-layout">
              <div>
                <h2>
                  {t("contactOne")}
                  <br />
                  <em>{t("contactTwo")}</em>
                </h2>
                <p>{t("contactDesc")}</p>
                <a href={`mailto:${profile.email}`} className="contact-email" dir="ltr">
                  {profile.email}
                  <Icon />
                </a>
              </div>
              <a
                className="contact-circle"
                href={`mailto:${profile.email}`}
                aria-label={t("email")}
              >
                <Icon />
              </a>
            </div>
            <div className="contact-meta">
              <span>{t("location")}</span>
              <span className="linkedin-setting">
                LinkedIn <span dir="ltr">@{profile.linkedinHandle}</span>
              </span>
              {socials.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noreferrer">
                  {name === "Website" ? t("website") : name}
                  <Icon />
                </a>
              ))}
              {profile.phone && <a href={`tel:${profile.phone}`}>{profile.phone}</a>}
            </div>
          </div>
        </section>
      </main>
      <footer className="footer container">
        <div className="footer-top">
          <a className="wordmark" dir="ltr" href="#top">
            ahk<span>.</span>
          </a>
          <div className="footer-identity">
            <strong>{text(profile.name, lang)}</strong>
            <span>{text(profile.title, lang)}</span>
          </div>
          <nav>
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {t(label)}
              </a>
            ))}
          </nav>
        </div>
        {socials.length > 0 && (
          <div className="footer-socials">
            {socials.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer">
                {name === "Website" ? t("website") : name}
                <Icon />
              </a>
            ))}
          </div>
        )}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {text(profile.name, lang)}. {t("rights")}
          </span>
          {language}
          <a href="#top">
            {t("top")}
            <Icon name="down" className="up-arrow" />
          </a>
        </div>
      </footer>
    </>
  );
}

function SectionHeading({
  n,
  label,
  title,
  description,
}: {
  n: string;
  label: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="section-heading reveal">
      <span className="section-label">
        <span>{n} /</span>
        {label}
      </span>
      <div className="section-heading-content">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function CaseStudy({ project, lang }: { project: Project; lang: Lang }) {
  const t = (key: UIKey) => text(ui[key], lang);
  const experience = experiences.find((e) => e.company.toLowerCase() === project.id);
  const impact = metrics.filter((m) => m.company.toLowerCase() === project.id);
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <article className="case-study container">
      <a href="#work" className="case-back">
        <Icon />
        {t("back")}
      </a>
      <div className="case-intro">
        <span className="eyebrow">{t("draft")}</span>
        <h1>{project.name}</h1>
        <p className="case-category">{text(project.category, lang)}</p>
        <p>{t("draftDesc")}</p>
      </div>
      <ProjectMedia project={project} lang={lang} />
      <div className="case-sections">
        {caseSections.map((key, i) => {
          const custom = project.caseContent?.[i];
          const media = project.caseMedia?.[i];
          const visualSection = [5, 6, 7].includes(i);
          const known =
            i === 0
              ? text(project.category, lang)
              : i === 2 && experience
                ? `${text(experience.role, lang)} · ${text(experience.dates, lang)}`
                : null;
          return (
            <section
              className={`case-section reveal${visualSection ? " case-section-visual" : ""}`}
              key={key}
            >
              <div>
                <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
                <h2>{t(key)}</h2>
              </div>
              <div>
                {custom ? (
                  <p>{text(custom, lang)}</p>
                ) : known ? (
                  <p>{known}</p>
                ) : i === 9 && impact.length ? (
                  impact.map((m) => (
                    <div className="case-result" key={m.value}>
                      <strong dir="ltr">{m.value}</strong>
                      <p>{text(m.detail, lang)}</p>
                    </div>
                  ))
                ) : visualSection || media ? null : (
                  <div className="content-placeholder">
                    <span className="eyebrow">{t("contentPlaceholder")}</span>
                    <p>{t("contentNote")}</p>
                  </div>
                )}
                {(media || visualSection) && (
                  <ProjectMedia
                    project={{
                      ...project,
                      image: i === 7 ? project.image : undefined,
                      secondaryImage: i === 7 ? project.secondaryImage : undefined,
                      device: i === 5 ? "browser" : i === 6 ? "tablet" : project.device,
                      ...media,
                    }}
                    lang={lang}
                  />
                )}
                {i === 2 && experience && (
                  <ul className="case-contributions">
                    {experience.bullets.map((b, j) => (
                      <li key={j}>{text(b, lang)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <a href={`#/work/${next.id}`} className="next-project">
        <span>{t("next")}</span>
        <h2>{next.name}</h2>
        <Icon />
      </a>
    </article>
  );
}
