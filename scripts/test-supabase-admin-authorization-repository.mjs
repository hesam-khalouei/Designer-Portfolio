import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
});

try {
  const [{ SupabaseAdminAuthorizationRepository }, { AdminAuthError }] = await Promise.all([
    server.ssrLoadModule(
      "/src/infrastructure/repositories/SupabaseAdminAuthorizationRepository.ts",
    ),
    server.ssrLoadModule("/src/application/errors/AdminAuthError.ts"),
  ]);

  function fakeClient(result) {
    const calls = [];
    const query = {
      select(columns) {
        calls.push({ method: "select", columns });
        return query;
      },
      eq(column, value) {
        calls.push({ method: "eq", column, value });
        return query;
      },
      async maybeSingle() {
        calls.push({ method: "maybeSingle" });
        if (result instanceof Error) throw result;
        return result;
      },
    };

    return {
      calls,
      from(table) {
        calls.push({ method: "from", table });
        return query;
      },
    };
  }

  const activeClient = fakeClient({ data: { user_id: "admin-1" }, error: null });
  assert.equal(await new SupabaseAdminAuthorizationRepository(activeClient).isActiveAdmin(), true);
  assert.deepEqual(activeClient.calls, [
    { method: "from", table: "admin_profiles" },
    { method: "select", columns: "user_id" },
    { method: "eq", column: "is_active", value: true },
    { method: "maybeSingle" },
  ]);
  console.log("PASS: active admin profile grants authorization");

  const inactiveClient = fakeClient({ data: null, error: null });
  assert.equal(
    await new SupabaseAdminAuthorizationRepository(inactiveClient).isActiveAdmin(),
    false,
  );
  console.log("PASS: missing or RLS-hidden profile denies authorization");

  const malformedClient = fakeClient({ data: {}, error: null });
  assert.equal(
    await new SupabaseAdminAuthorizationRepository(malformedClient).isActiveAdmin(),
    false,
  );
  console.log("PASS: malformed profile data fails closed");

  const cardinalityClient = fakeClient({
    data: null,
    error: { code: "PGRST116", message: "Unexpected row cardinality" },
  });
  assert.equal(
    await new SupabaseAdminAuthorizationRepository(cardinalityClient).isActiveAdmin(),
    false,
  );
  console.log("PASS: PGRST116 does not grant authorization");

  const queryError = { code: "42501", message: "permission denied" };
  const errorClient = fakeClient({ data: null, error: queryError });
  await assert.rejects(
    () => new SupabaseAdminAuthorizationRepository(errorClient).isActiveAdmin(),
    (error) =>
      error instanceof AdminAuthError &&
      error.code === "ACCESS_DENIED" &&
      error.cause === queryError,
  );
  console.log("PASS: database authorization errors map to ACCESS_DENIED");

  const networkError = new TypeError("Failed to fetch");
  const networkClient = fakeClient(networkError);
  await assert.rejects(
    () => new SupabaseAdminAuthorizationRepository(networkClient).isActiveAdmin(),
    (error) =>
      error instanceof AdminAuthError &&
      error.code === "AUTH_PROVIDER_UNAVAILABLE" &&
      error.cause === networkError,
  );
  console.log("PASS: network errors map to AUTH_PROVIDER_UNAVAILABLE");

  await assert.rejects(
    () => new SupabaseAdminAuthorizationRepository(null).isActiveAdmin(),
    (error) => error instanceof AdminAuthError && error.code === "AUTH_PROVIDER_UNAVAILABLE",
  );
  console.log("PASS: missing Supabase client fails closed");

  console.log("\nAll Supabase admin authorization repository tests passed.");
} finally {
  await server.close();
}
