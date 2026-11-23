import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { text } from "./domain/localization/LocalizedText";
import type { Lang, Text } from "./domain/localization/LocalizedText";
import type { Project, DeviceType } from "./domain/content/entities/PortfolioContent";
import { ui } from "./locales";

export function Icon({
  name = "arrow",
  className = "",
}: {
  name?: "arrow" | "down" | "sun" | "moon" | "menu" | "close" | "plus";
  className?: string;
}) {
  const paths = {
    arrow: "M5 19 19 5M5 5h14v14",
    down: "M12 4v16m-6-6 6 6 6-6",
    sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5",
    moon: "M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z",
    menu: "M4 7h16M4 12h16M4 17h16",
    close: "m6 6 12 12M6 18 18 6",
    plus: "M12 5v14M5 12h14",
  };
  return (
    <svg
      className={`icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
      {name === "sun" && <circle cx="12" cy="12" r="4" />}
    </svg>
  );
}
export function LanguageControl({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div className="language-control" role="group" aria-label={text(ui.langLabel, lang)} dir="ltr">
      {(["en", "fa", "ar"] as Lang[]).map((l) => (
        <button
          key={l}
          lang={l}
          aria-label={l === "en" ? "English" : l === "fa" ? "فارسی" : "العربية"}
          aria-pressed={lang === l}
          onClick={() => onChange(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
function Screen({
  src,
  lang,
  type,
  alt,
}: {
  src?: string;
  lang: Lang;
  type: DeviceType;
  alt?: Text;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <div className="device-screen">
      {src && !failed ? (
        <img
          src={src}
          alt={text(alt || ui.screenshot, lang)}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="screen-placeholder">
          <span className="placeholder-cross" aria-hidden="true" />
          <span>{text(ui.screenshot, lang)}</span>
          <small>{type === "phone" ? "9 : 19.5" : type === "tablet" ? "4 : 3" : "16 : 10"}</small>
        </div>
      )}
    </div>
  );
}
export function Device({
  type,
  src,
  lang,
  className = "",
  alt,
}: {
  type: DeviceType;
  src?: string;
  lang: Lang;
  className?: string;
  alt?: Text;
}) {
  return (
    <div className={`device device-${type} ${className}`} dir="ltr">
      {type === "phone" && <span className="phone-camera" />}
      {(type === "browser" || type === "laptop" || type === "monitor") && (
        <div className="browser-chrome">
          <i />
          <i />
          <i />
          <span />
        </div>
      )}
      <Screen src={src} lang={lang} type={type} alt={alt} />
      {type === "phone" && <span className="phone-home" />}
    </div>
  );
}
export function ProjectMedia({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <div className={`project-media media-${project.id} composition-${project.device}`}>
      <span className="media-corner" aria-hidden="true">
        +
      </span>
      <div className="devices">
        {project.device === "phone" ? (
          <>
            <Device
              type="phone"
              src={project.image}
              alt={project.imageAlt}
              lang={lang}
              className="phone-back"
            />
            <Device
              type="phone"
              src={project.secondaryImage || project.image}
              lang={lang}
              className="phone-front"
              alt={project.imageAlt}
            />
          </>
        ) : project.device === "multi" ? (
          <>
            <Device type="browser" src={project.image} alt={project.imageAlt} lang={lang} />
            <Device type="phone" src={project.secondaryImage} alt={project.imageAlt} lang={lang} />
          </>
        ) : (
          <Device type={project.device} src={project.image} alt={project.imageAlt} lang={lang} />
        )}
      </div>
      {!project.image && <span className="media-caption">{text(ui.mediaSoon, lang)}</span>}
      <span className="media-corner end" aria-hidden="true">
        +
      </span>
    </div>
  );
}
export function ProjectCard({
  project,
  lang,
  index,
}: {
  project: Project;
  lang: Lang;
  index: number;
}) {
  return (
    <a className={`project-card project-${index} reveal`} href={`#/work/${project.id}`}>
      <ProjectMedia project={project} lang={lang} />
      <div className="project-meta">
        <span className="eyebrow">{text(project.sector, lang)}</span>
        <span className="project-index">0{index + 1}</span>
      </div>
      <div className="project-title">
        <h3>{project.name}</h3>
        <span className="circle-arrow">
          <Icon />
        </span>
      </div>
      <p>{text(project.category, lang)}</p>
      <span className="case-link">
        {text(ui.case, lang)} <span aria-hidden="true">↗</span>
      </span>
    </a>
  );
}
export function MetricNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const target = Number(value.replace(/[^\d]/g, ""));
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1000, 1);
          setShown(`${value[0]}${Math.round(target * (1 - Math.pow(1 - p, 3)))}%`);
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span className="metric-number" ref={ref} dir="ltr" aria-label={value}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
export function useReveals(dependency: string) {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.07 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [dependency]);
}
export const stagger = (i: number) => ({ "--reveal-delay": `${i * 50}ms` }) as CSSProperties;
