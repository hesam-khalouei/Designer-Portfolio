import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
});

try {
  const { SupabasePortfolioRepository } = await server.ssrLoadModule(
    "/src/infrastructure/repositories/SupabasePortfolioRepository.ts",
  );

  const { SupabasePortfolioRepositoryError } = await server.ssrLoadModule(
    "/src/infrastructure/repositories/supabase-portfolio-repository-errors.ts",
  );

  const { PortfolioContentDecodeError } = await server.ssrLoadModule(
    "/src/infrastructure/content/supabase/portfolio-content-errors.ts",
  );

  const columns =
    "entity_id,entity_type,entity_key,sort_order,locale_code,schema_version,payload";

  const locales = ["en", "fa", "ar", "und"];

  const rows = [
    ...locales.map((locale) => ({
      entity_id: "profile-id",
      entity_type: "profile",
      entity_key: "profile",
      sort_order: 0,
      locale_code: locale,
      schema_version: 1,
      payload:
        locale === "und"
          ? {
              email: "test@example.com",
              linkedinHandle: "designer",
              socials: { LinkedIn: "", Dribbble: "", Website: "" },
              phone: "",
            }
          : {
              name: `Name ${locale}`,
              title: `Title ${locale}`,
            },
    })),
    ...locales.map((locale) => ({
      entity_id: "summary-id",
      entity_type: "summary",
      entity_key: "summary",
      sort_order: 0,
      locale_code: locale,
      schema_version: 1,
      payload:
        locale === "und" ? {} : { value: `Summary ${locale}` },
    })),
  ];

  function fakeClient({ data = rows, error = null, thrown = null } = {}) {
    const calls = [];

    return {
      calls,
      client: {
        from(table) {
          calls.push({ table });

          return {
            select(selectedColumns) {
              calls[calls.length - 1].columns = selectedColumns;

              if (thrown) throw thrown;

              return Promise.resolve({ data, error });
            },
          };
        },
      },
    };
  }

  const successful = fakeClient();
  const repository = new SupabasePortfolioRepository(successful.client);
  const content = await repository.getPortfolioContent();

  assert.equal(content.profile.name[0], "Name en");
  assert.equal(content.profile.name[1], "Name fa");
  assert.equal(content.summary[2], "Summary ar");
  assert.deepEqual(successful.calls, [
    {
      table: "published_portfolio_content",
      columns,
    },
  ]);

  console.log("PASS reads and decodes published portfolio content");
  console.log("PASS queries the published view with explicit columns");

  await assert.rejects(
    () => new SupabasePortfolioRepository(null).getPortfolioContent(),
    (error) =>
      error instanceof SupabasePortfolioRepositoryError &&
      error.code === "SUPABASE_NOT_CONFIGURED",
  );

  console.log("PASS rejects an unconfigured Supabase client");

  const databaseError = new Error("Database unavailable");
  const failedRead = fakeClient({ error: databaseError });

  await assert.rejects(
    () =>
      new SupabasePortfolioRepository(failedRead.client).getPortfolioContent(),
    (error) =>
      error instanceof SupabasePortfolioRepositoryError &&
      error.code === "SUPABASE_READ_FAILED" &&
      error.cause === databaseError,
  );

  console.log("PASS reports Supabase response errors");

  const networkError = new Error("Network failure");
  const failedNetwork = fakeClient({ thrown: networkError });

  await assert.rejects(
    () =>
      new SupabasePortfolioRepository(failedNetwork.client).getPortfolioContent(),
    (error) =>
      error instanceof SupabasePortfolioRepositoryError &&
      error.code === "SUPABASE_READ_FAILED" &&
      error.cause === networkError,
  );

  console.log("PASS reports thrown network errors");

  const invalidResponse = fakeClient({ data: null });

  await assert.rejects(
    () =>
      new SupabasePortfolioRepository(invalidResponse.client).getPortfolioContent(),
    (error) =>
      error instanceof SupabasePortfolioRepositoryError &&
      error.code === "SUPABASE_INVALID_RESPONSE",
  );

  console.log("PASS rejects non-array Supabase responses");

  const invalidRows = fakeClient({ data: [] });

  await assert.rejects(
    () =>
      new SupabasePortfolioRepository(invalidRows.client).getPortfolioContent(),
    (error) => error instanceof PortfolioContentDecodeError,
  );

  console.log("PASS preserves decoder validation errors");
  console.log("\nAll Supabase portfolio repository tests passed.");
} finally {
  await server.close();
}
