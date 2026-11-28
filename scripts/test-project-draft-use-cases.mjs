import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
});

try {
  const [
    { ListProjectDrafts },
    { GetProjectDraft },
    { CreateProject },
    { SaveProjectDraft },
  ] = await Promise.all([
    server.ssrLoadModule("/src/application/use-cases/projects/ListProjectDrafts.ts"),
    server.ssrLoadModule("/src/application/use-cases/projects/GetProjectDraft.ts"),
    server.ssrLoadModule("/src/application/use-cases/projects/CreateProject.ts"),
    server.ssrLoadModule("/src/application/use-cases/projects/SaveProjectDraft.ts"),
  ]);

  const calls = [];
  const draft = {
    projectId: "new-project",
    locale: "en",
    revision: 1,
    sortOrder: 10,
    shared: { name: "New Project", device: "browser" },
    localized: { category: "Platform" },
  };
  const list = [{
    projectId: "new-project",
    name: "New Project",
    device: "browser",
    sortOrder: 10,
    revision: 1,
    hasDraft: true,
  }];

  const repository = {
    async listProjectDrafts(locale) {
      calls.push({ method: "listProjectDrafts", locale });
      return list;
    },
    async getProjectDraft(projectId, locale) {
      calls.push({ method: "getProjectDraft", projectId, locale });
      return draft;
    },
    async createProject(input) {
      calls.push({ method: "createProject", input });
      return draft;
    },
    async saveProjectDraft(input) {
      calls.push({ method: "saveProjectDraft", input });
      return draft;
    },
  };

  assert.equal(await new ListProjectDrafts(repository).execute("en"), list);
  assert.deepEqual(calls.pop(), { method: "listProjectDrafts", locale: "en" });
  console.log("PASS: list project drafts delegates locale and returns repository result");

  assert.equal(await new GetProjectDraft(repository).execute("new-project", "fa"), draft);
  assert.deepEqual(calls.pop(), {
    method: "getProjectDraft",
    projectId: "new-project",
    locale: "fa",
  });
  console.log("PASS: get project draft delegates project ID and locale");

  const createInput = {
    projectId: "new-project",
    initialLocale: "en",
    shared: { name: "New Project", device: "browser" },
  };
  assert.equal(await new CreateProject(repository).execute(createInput), draft);
  assert.deepEqual(calls.pop(), { method: "createProject", input: createInput });
  console.log("PASS: create project delegates input and returns repository result");

  const saveInput = {
    projectId: "new-project",
    locale: "en",
    expectedRevision: 1,
    localized: { category: "Updated category" },
  };
  assert.equal(await new SaveProjectDraft(repository).execute(saveInput), draft);
  assert.deepEqual(calls.pop(), { method: "saveProjectDraft", input: saveInput });
  console.log("PASS: save project draft delegates revision-aware input");

  const failure = new Error("Repository failure");
  const failingRepository = {
    ...repository,
    async saveProjectDraft() {
      throw failure;
    },
  };
  await assert.rejects(
    () => new SaveProjectDraft(failingRepository).execute(saveInput),
    (error) => error === failure,
  );
  console.log("PASS: repository errors propagate without being swallowed");

  console.log("\nAll Project CMS application use-case tests passed.");
} finally {
  await server.close();
}
