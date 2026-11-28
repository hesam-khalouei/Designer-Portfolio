import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
});

try {
  const { SupabaseProjectDraftRepository } = await server.ssrLoadModule(
    "/src/infrastructure/repositories/SupabaseProjectDraftRepository.ts",
  );
  const { ProjectDraftError } = await server.ssrLoadModule(
    "/src/application/errors/ProjectDraftError.ts",
  );

  function createFakeClient({
    entities = [],
    units = [],
    revisions = [],
    rpcError = null,
  } = {}) {
    const calls = [];
    const rpcCalls = [];

    const client = {
      from(table) {
        const query = {
          table,
          filters: [],
          orders: [],
          selected: "",
          offset: 0,
          limit: 500,

          select(columns) {
            this.selected = columns;
            return this;
          },
          eq(column, value) {
            this.filters.push({ method: "eq", column, value });
            return this;
          },
          in(column, value) {
            this.filters.push({ method: "in", column, value });
            return this;
          },
          order(column, options) {
            this.orders.push({ column, ...options });
            return this;
          },
          range(from, to) {
            this.offset = from;
            this.limit = to - from + 1;
            return this.execute();
          },
          maybeSingle() {
            return this.execute(true);
          },
          then(resolve, reject) {
            return this.execute().then(resolve, reject);
          },
          execute(single = false) {
            const call = {
              table,
              columns: this.selected,
              filters: [...this.filters],
              orders: [...this.orders],
              offset: this.offset,
              limit: this.limit,
            };
            calls.push(call);

            let rows =
              table === "content_entities" ? entities :
              table === "publication_units" ? units :
              table === "content_revisions" ? revisions : [];

            for (const filter of this.filters) {
              rows = rows.filter((row) => {
                if (filter.method === "eq") {
                  return row[filter.column] === filter.value;
                }
                return filter.value.includes(row[filter.column]);
              });
            }

            for (const order of [...this.orders].reverse()) {
              rows = [...rows].sort((a, b) => {
                const left = a[order.column];
                const right = b[order.column];
                return (left < right ? -1 : left > right ? 1 : 0) *
                  (order.ascending === false ? -1 : 1);
              });
            }

            if (single) {
              return Promise.resolve({
                data: rows[0] ?? null,
                error: null,
              });
            }

            return Promise.resolve({
              data: rows.slice(this.offset, this.offset + this.limit),
              error: null,
            });
          },
        };

        return query;
      },

      async rpc(name, args) {
        rpcCalls.push({ name, args });
        return { data: null, error: rpcError };
      },
    };

    return { client, calls, rpcCalls };
  }

  const sharedPayload = {
    name: "Project Alpha",
    device: "laptop",
  };

  const entities = [{
    id: "entity-1",
    entity_type: "project",
    entity_key: "project-alpha",
    sort_order: 10,
  }];

  const units = [
    {
      id: "unit-und",
      entity_id: "entity-1",
      locale_code: "und",
      draft_revision_id: "revision-und",
    },
    {
      id: "unit-en",
      entity_id: "entity-1",
      locale_code: "en",
      draft_revision_id: "revision-en",
    },
    {
      id: "unit-fa",
      entity_id: "entity-1",
      locale_code: "fa",
      draft_revision_id: "revision-fa",
    },
  ];

  const revisions = [
    {
      id: "revision-und",
      publication_unit_id: "unit-und",
      revision_number: 3,
      payload: sharedPayload,
    },
    {
      id: "revision-en",
      publication_unit_id: "unit-en",
      revision_number: 2,
      payload: { category: "Design", sector: "Technology" },
    },
    {
      id: "revision-fa",
      publication_unit_id: "unit-fa",
      revision_number: 1,
      payload: { category: "طراحی", sector: "فناوری" },
    },
  ];

  const successful = createFakeClient({ entities, units, revisions });
  const repository = new SupabaseProjectDraftRepository(successful.client);

  const draft = await repository.getProjectDraft("project-alpha", "en");

  assert.equal(draft.projectId, "project-alpha");
  assert.equal(draft.locale, "en");
  assert.equal(draft.revision, 2);
  assert.equal(draft.sharedRevision, 3);
  assert.equal(draft.shared.name, "Project Alpha");
  assert.equal(draft.localized.category, "Design");

  console.log("PASS reads shared and locale-specific revisions independently");

  const listed = await repository.listProjectDrafts("fa");

  assert.equal(listed.length, 1);
  assert.equal(listed[0].projectId, "project-alpha");
  assert.equal(listed[0].revision, 1);
  assert.equal(listed[0].sharedRevision, 3);
  assert.equal(listed[0].hasDraft, true);

  const unitCalls = successful.calls.filter(
    (call) => call.table === "publication_units",
  );
  const listUnitCalls = unitCalls.slice(1);
  assert.ok(listUnitCalls.length > 0 && listUnitCalls.every((call) =>
    call.filters.some((filter) =>
      filter.column === "entity_id" && filter.method === "in",
    ),
  ));

  console.log("PASS lists projects with locale and shared revision metadata");
  console.log("PASS scopes publication-unit queries to project entity IDs");

  const missing = await repository.getProjectDraft("missing-project", "en");
  assert.equal(missing, null);

  console.log("PASS returns null for a missing project");

  await assert.rejects(
    () => new SupabaseProjectDraftRepository(null).listProjectDrafts("en"),
    (error) =>
      error instanceof ProjectDraftError &&
      error.code === "PERSISTENCE_UNAVAILABLE",
  );

  console.log("PASS rejects an unconfigured Supabase client");

  const denied = createFakeClient({
    entities,
    units,
    revisions,
    rpcError: { code: "42501", message: "permission denied" },
  });

  await assert.rejects(
    () => new SupabaseProjectDraftRepository(denied.client).createProject({
      projectId: "new-project",
      initialLocale: "en",
      shared: sharedPayload,
      localized: { category: "Design" },
    }),
    (error) =>
      error instanceof ProjectDraftError &&
      error.code === "ACCESS_DENIED",
  );

  assert.equal(denied.rpcCalls[0].name, "create_project_draft");

  console.log("PASS maps project creation authorization failures");

  const conflict = createFakeClient({
    rpcError: {
      code: "P0001",
      message: "REVISION_CONFLICT",
    },
  });

  await assert.rejects(
    () => new SupabaseProjectDraftRepository(conflict.client).saveProjectDraft({
      projectId: "project-alpha",
      locale: "en",
      expectedRevision: 1,
      localized: { category: "Updated" },
    }),
    (error) =>
      error instanceof ProjectDraftError &&
      error.code === "REVISION_CONFLICT",
  );

  assert.equal(conflict.rpcCalls[0].name, "save_project_draft");

  console.log("PASS maps optimistic concurrency conflicts");

  console.log("\nAll Supabase project draft repository tests passed.");
} finally {
  await server.close();
}
