import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
});

try {
  const [{ SupabaseAdminAuthRepository }, { AdminAuthError }] = await Promise.all([
    server.ssrLoadModule("/src/infrastructure/repositories/SupabaseAdminAuthRepository.ts"),
    server.ssrLoadModule("/src/application/errors/AdminAuthError.ts"),
  ]);

  const session = {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    expires_at: 1800000000,
    user: { id: "admin-1", email: "admin@example.com" },
  };

  function fakeClient(overrides = {}) {
    const calls = [];
    let authListener = null;
    let unsubscribed = false;

    const auth = {
      async signInWithPassword(credentials) {
        calls.push({ method: "signInWithPassword", credentials });
        return { data: { session }, error: null };
      },
      async getSession() {
        calls.push({ method: "getSession" });
        return { data: { session }, error: null };
      },
      async signOut() {
        calls.push({ method: "signOut" });
        return { error: null };
      },
      onAuthStateChange(listener) {
        calls.push({ method: "onAuthStateChange" });
        authListener = listener;
        return {
          data: {
            subscription: {
              unsubscribe() {
                unsubscribed = true;
              },
            },
          },
        };
      },
      ...overrides,
    };

    return {
      calls,
      auth,
      emit(event, value) {
        authListener?.(event, value);
      },
      isUnsubscribed: () => unsubscribed,
    };
  }

  const successful = fakeClient();
  const repository = new SupabaseAdminAuthRepository(successful);

  const signedIn = await repository.signInWithPassword(
    "admin@example.com",
    "password",
  );

  assert.deepEqual(signedIn, {
    identity: { id: "admin-1", email: "admin@example.com" },
    expiresAt: 1800000000000,
    assuranceLevel: "aal1",
  });
  assert.equal(successful.calls[0].credentials.email, "admin@example.com");
  assert.equal("access_token" in signedIn, false);
  assert.equal("refresh_token" in signedIn, false);
  console.log("PASS: sign-in maps Supabase session without exposing tokens");

  assert.deepEqual(await repository.getCurrentSession(), signedIn);
  console.log("PASS: restores and maps the current session");

  const signedOutClient = fakeClient({
    async getSession() {
      return { data: { session: null }, error: null };
    },
  });
  assert.equal(
    await new SupabaseAdminAuthRepository(signedOutClient).getCurrentSession(),
    null,
  );
  console.log("PASS: returns null when no session exists");

  const noExpiryClient = fakeClient({
    async getSession() {
      return {
        data: {
          session: {
            ...session,
            expires_at: undefined,
          },
        },
        error: null,
      };
    },
  });
  assert.equal(
    (await new SupabaseAdminAuthRepository(noExpiryClient).getCurrentSession()).expiresAt,
    null,
  );
  console.log("PASS: handles sessions without an expiry timestamp");

  const invalidCredentialsClient = fakeClient({
    async signInWithPassword() {
      return {
        data: { session: null },
        error: Object.assign(new Error("Invalid login credentials"), {
          code: "invalid_credentials",
          status: 400,
        }),
      };
    },
  });
  await assert.rejects(
    () => new SupabaseAdminAuthRepository(invalidCredentialsClient)
      .signInWithPassword("admin@example.com", "wrong"),
    (error) => error instanceof AdminAuthError && error.code === "INVALID_CREDENTIALS",
  );
  console.log("PASS: maps invalid credentials");

  const rateLimitedClient = fakeClient({
    async signInWithPassword() {
      return {
        data: { session: null },
        error: Object.assign(new Error("Too many requests"), {
          code: "over_request_rate_limit",
          status: 429,
        }),
      };
    },
  });
  await assert.rejects(
    () => new SupabaseAdminAuthRepository(rateLimitedClient)
      .signInWithPassword("admin@example.com", "password"),
    (error) => error instanceof AdminAuthError && error.code === "RATE_LIMITED",
  );
  console.log("PASS: maps rate-limit errors");

  const networkClient = fakeClient({
    async getSession() {
      throw Object.assign(new TypeError("Failed to fetch"), { name: "TypeError" });
    },
  });
  await assert.rejects(
    () => new SupabaseAdminAuthRepository(networkClient).getCurrentSession(),
    (error) => error instanceof AdminAuthError && error.code === "AUTH_PROVIDER_UNAVAILABLE",
  );
  console.log("PASS: maps network failures");

  const malformedClient = fakeClient({
    async getSession() {
      return {
        data: {
          session: {
            ...session,
            user: { id: "admin-1", email: null },
          },
        },
        error: null,
      };
    },
  });
  await assert.rejects(
    () => new SupabaseAdminAuthRepository(malformedClient).getCurrentSession(),
    (error) => error instanceof AdminAuthError && error.code === "AUTH_OPERATION_FAILED",
  );
  console.log("PASS: rejects incomplete user identities");

  await repository.signOut();
  assert.equal(successful.calls.some((call) => call.method === "signOut"), true);
  console.log("PASS: signs out through Supabase Auth");

  let observed = "not-called";
  const unsubscribe = repository.subscribeToAuthChanges((value) => {
    observed = value;
  });

  successful.emit("SIGNED_IN", session);
  assert.equal(observed.identity.id, "admin-1");

  successful.emit("SIGNED_OUT", null);
  assert.equal(observed, null);

  unsubscribe();
  assert.equal(successful.isUnsubscribed(), true);
  console.log("PASS: maps auth events and unsubscribes correctly");

  const invalidEventClient = fakeClient();
  let invalidEventValue = "not-called";
  const stop = new SupabaseAdminAuthRepository(invalidEventClient)
    .subscribeToAuthChanges((value) => {
      invalidEventValue = value;
    });
  invalidEventClient.emit("SIGNED_IN", {
    ...session,
    user: { id: "", email: null },
  });
  assert.equal(invalidEventValue, null);
  stop();
  console.log("PASS: fails closed for malformed auth events");

  await assert.rejects(
    () => new SupabaseAdminAuthRepository(null).getCurrentSession(),
    (error) => error instanceof AdminAuthError &&
      error.code === "AUTH_PROVIDER_UNAVAILABLE",
  );
  console.log("PASS: rejects an unconfigured Supabase client");

  console.log("\nAll Supabase admin authentication adapter tests passed.");
} finally {
  await server.close();
}
