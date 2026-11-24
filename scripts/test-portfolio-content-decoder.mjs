import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
});

try {
  const { decodePortfolioContent } = await server.ssrLoadModule(
    "/src/infrastructure/content/supabase/portfolio-content-decoder.ts",
  );

  const { PortfolioContentDecodeError } = await server.ssrLoadModule(
    "/src/infrastructure/content/supabase/portfolio-content-errors.ts",
  );

  const locales = ["en", "fa", "ar", "und"];

  function entity(type, key, order, payloads) {
    return locales.map((locale) => ({
      entity_id: `${type}-${key}`,
      entity_type: type,
      entity_key: key,
      sort_order: order,
      locale_code: locale,
      schema_version: 1,
      payload: payloads[locale],
    }));
  }

  const rows = [
    ...entity("profile", "profile", 0, {
      und: {
        email: "test@example.com",
        linkedinHandle: "designer",
        socials: { LinkedIn: "", Dribbble: "", Website: "" },
        phone: "",
      },
      en: { name: "Name EN", title: "Title EN" },
      fa: { name: "Name FA", title: "Title FA" },
      ar: { name: "Name AR", title: "Title AR" },
    }),
    ...entity("summary", "summary", 0, {
      und: {},
      en: { value: "Summary EN" },
      fa: { value: "Summary FA" },
      ar: { value: "Summary AR" },
    }),
    ...entity("project", "project-a", 2, {
      und: {
        name: "Project A",
        device: "browser",
        caseMedia: {
          journey: { image: "/journey.png", device: "browser" },
        },
      },
      en: {
        category: "Category EN",
        sector: "Sector EN",
        imageAlt: "Alt EN",
        caseContent: { overview: "Overview EN" },
        caseMediaAlt: { journey: "Journey EN" },
      },
      fa: {
        category: "Category FA",
        sector: "Sector FA",
        imageAlt: "Alt FA",
        caseContent: { overview: "Overview FA" },
        caseMediaAlt: { journey: "Journey FA" },
      },
      ar: {
        category: "Category AR",
        sector: "Sector AR",
        imageAlt: "Alt AR",
        caseContent: { overview: "Overview AR" },
        caseMediaAlt: { journey: "Journey AR" },
      },
    }),
    ...entity("experience", "experience-a", 1, {
      und: { company: "Company A" },
      en: { role: "Role EN", dates: "Dates EN", bullets: ["Bullet EN"] },
      fa: { role: "Role FA", dates: "Dates FA", bullets: ["Bullet FA"] },
      ar: { role: "Role AR", dates: "Dates AR", bullets: ["Bullet AR"] },
    }),
    ...entity("metric", "metric-a", 0, {
      und: { value: "25%", company: "Company A" },
      en: { label: "Label EN", detail: "Detail EN" },
      fa: { label: "Label FA", detail: "Detail FA" },
      ar: { label: "Label AR", detail: "Detail AR" },
    }),
    ...entity("capability", "capability-a", 0, {
      und: {},
      en: { title: "Title EN", skills: ["Skill EN"] },
      fa: { title: "Title FA", skills: ["Skill FA"] },
      ar: { title: "Title AR", skills: ["Skill AR"] },
    }),
    ...entity("service", "service-a", 0, {
      und: {},
      en: { title: "Service EN", description: "Description EN" },
      fa: { title: "Service FA", description: "Description FA" },
      ar: { title: "Service AR", description: "Description AR" },
    }),
    ...entity("certification", "certification-a", 0, {
      und: {},
      en: { title: "Certificate EN", issuer: "Issuer EN", date: "Date EN" },
      fa: { title: "Certificate FA", issuer: "Issuer FA", date: "Date FA" },
      ar: { title: "Certificate AR", issuer: "Issuer AR", date: "Date AR" },
    }),
  ];

  const decoded = decodePortfolioContent(rows);

  assert.equal(decoded.profile.name[0], "Name EN");
  assert.equal(decoded.profile.name[1], "Name FA");
  assert.equal(decoded.summary[2], "Summary AR");
  assert.equal(decoded.projects[0].id, "project-a");
  assert.equal(decoded.projects[0].caseContent[0][0], "Overview EN");
  assert.equal(decoded.projects[0].caseMedia[5].image, "/journey.png");
  assert.deepEqual(decoded.projects[0].caseMedia[5].imageAlt, [
    "Journey EN",
    "Journey FA",
    "Journey AR",
  ]);
  assert.deepEqual(decoded.experiences[0].bullets[0], [
    "Bullet EN",
    "Bullet FA",
    "Bullet AR",
  ]);
  assert.deepEqual(decoded.capabilities[0].skills[0], [
    "Skill EN",
    "Skill FA",
    "Skill AR",
  ]);
  assert.equal(decoded.metrics[0].value, "25%");
  assert.equal(decoded.services[0].description[1], "Description FA");
  assert.equal(decoded.certifications[0].issuer[2], "Issuer AR");

  const orderedRows = [
    ...entity("project", "project-b", 1, {
      und: { name: "Project B", device: "phone" },
      en: { category: "B", sector: "B" },
      fa: { category: "ب", sector: "ب" },
      ar: { category: "ب", sector: "ب" },
    }),
    ...rows,
  ];

  const ordered = decodePortfolioContent(orderedRows);
  assert.deepEqual(
    ordered.projects.map((project) => project.id),
    ["project-b", "project-a"],
  );

  const missingLocale = rows.filter(
    (row) => !(row.entity_type === "summary" && row.locale_code === "ar"),
  );
  assert.throws(
    () => decodePortfolioContent(missingLocale),
    (error) =>
      error instanceof PortfolioContentDecodeError &&
      error.code === "MISSING_LOCALE",
  );

  const duplicateLocale = [...rows, rows[0]];
  assert.throws(
    () => decodePortfolioContent(duplicateLocale),
    (error) =>
      error instanceof PortfolioContentDecodeError &&
      error.code === "DUPLICATE_LOCALE",
  );

  const unsupportedVersion = rows.map((row) =>
    row.entity_type === "summary" && row.locale_code === "en"
      ? { ...row, schema_version: 2 }
      : row,
  );
  assert.throws(
    () => decodePortfolioContent(unsupportedVersion),
    (error) =>
      error instanceof PortfolioContentDecodeError &&
      error.code === "INVALID_SCHEMA_VERSION",
  );

  const invalidSection = rows.map((row) =>
    row.entity_type === "project" && row.locale_code === "en"
      ? {
          ...row,
          payload: {
            ...row.payload,
            caseContent: { unknownSection: "Invalid" },
          },
        }
      : row,
  );
  assert.throws(
    () => decodePortfolioContent(invalidSection),
    (error) =>
      error instanceof PortfolioContentDecodeError &&
      error.code === "INVALID_SECTION",
  );

  console.log("PASS decoder reconstructs all eight entity types");
  console.log("PASS localized text, bullets and skills");
  console.log("PASS semantic Case Study section mapping");
  console.log("PASS deterministic sort_order ordering");
  console.log("PASS missing locale rejection");
  console.log("PASS duplicate locale rejection");
  console.log("PASS unsupported schema version rejection");
  console.log("PASS unknown Case Study section rejection");
  console.log("\nAll portfolio decoder tests passed.");
} finally {
  await server.close();
}