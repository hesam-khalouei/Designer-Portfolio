import assert from "node:assert/strict";
import { createServer } from "vite";

async function loadBootstrap(source) {
  const server = await createServer({
    configFile: "./vite.config.ts",
    define: {
      "import.meta.env.VITE_PORTFOLIO_CONTENT_SOURCE":
        source === undefined ? "undefined" : JSON.stringify(source),
      "import.meta.env.VITE_SUPABASE_URL": "undefined",
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": "undefined",
    },
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
  });

  return { server, module: await server.ssrLoadModule(
    "/src/app/bootstrap/createAppDependencies.ts",
  ) };
}

const defaultCase = await loadBootstrap(undefined);
try {
  const dependencies = defaultCase.module.createAppDependencies();
  const content = await dependencies.getPortfolioContent.execute();

  assert.ok(content.profile);
  assert.ok(Array.isArray(content.profile.name));
  assert.ok(content.profile.name.length > 0);

  console.log("PASS defaults to Static Repository when source is absent");
} finally {
  await defaultCase.server.close();
}

const supabaseCase = await loadBootstrap("supabase");
try {
  const dependencies = supabaseCase.module.createAppDependencies();

  await assert.rejects(
    () => dependencies.getPortfolioContent.execute(),
    (error) => error?.code === "SUPABASE_NOT_CONFIGURED",
  );

  console.log("PASS explicitly selects Supabase Repository");
  console.log("PASS does not silently fall back to Static on Supabase failure");
} finally {
  await supabaseCase.server.close();
}

const invalidCase = await createServer({
  configFile: "./vite.config.ts",
  define: {
    "import.meta.env.VITE_PORTFOLIO_CONTENT_SOURCE": JSON.stringify("invalid"),
    "import.meta.env.VITE_SUPABASE_URL": "undefined",
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": "undefined",
  },
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
});

try {
  await assert.rejects(
    () => invalidCase.ssrLoadModule(
      "/src/app/bootstrap/createAppDependencies.ts",
    ),
    /Unsupported portfolio content source: invalid/,
  );

  console.log("PASS rejects unsupported content source values");
} finally {
  await invalidCase.close();
}

console.log("\nAll application bootstrap tests passed.");
