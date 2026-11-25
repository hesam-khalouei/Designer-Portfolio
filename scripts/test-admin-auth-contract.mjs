import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
});

try {
  const [{ SignInAdmin }, { SignOutAdmin }, { GetAdminSession }, { AdminAuthError }] =
    await Promise.all([
      server.ssrLoadModule("/src/application/use-cases/SignInAdmin.ts"),
      server.ssrLoadModule("/src/application/use-cases/SignOutAdmin.ts"),
      server.ssrLoadModule("/src/application/use-cases/GetAdminSession.ts"),
      server.ssrLoadModule("/src/application/errors/AdminAuthError.ts"),
    ]);

  const session = {
    identity: { id: "admin-1", email: "admin@example.com" },
    expiresAt: 1800000000000,
    assuranceLevel: "aal1",
  };

  let currentSession = null;
  const listeners = new Set();

  const repository = {
    async signInWithPassword(email, password) {
      if (email !== "admin@example.com" || password !== "correct-password") {
        throw new AdminAuthError("INVALID_CREDENTIALS", "Invalid credentials");
      }
      currentSession = session;
      listeners.forEach((listener) => listener(currentSession));
      return currentSession;
    },
    async getCurrentSession() {
      return currentSession;
    },
    async signOut() {
      currentSession = null;
      listeners.forEach((listener) => listener(null));
    },
    subscribeToAuthChanges(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  const signIn = new SignInAdmin(repository);
  const signOut = new SignOutAdmin(repository);
  const getSession = new GetAdminSession(repository);

  assert.equal(await getSession.execute(), null);
  console.log("PASS: no session is restored when signed out");

  assert.equal(await signIn.execute("admin@example.com", "correct-password"), session);
  assert.equal(await getSession.execute(), session);
  console.log("PASS: sign-in returns and restores the current session");

  await assert.rejects(
    signIn.execute("admin@example.com", "wrong-password"),
    (error) => error instanceof AdminAuthError && error.code === "INVALID_CREDENTIALS",
  );
  assert.equal(await getSession.execute(), session);
  console.log("PASS: invalid credentials are rejected without clearing an existing session");

  let observedSession;
  const unsubscribe = repository.subscribeToAuthChanges((value) => {
    observedSession = value;
  });
  await signOut.execute();
  assert.equal(observedSession, null);
  assert.equal(await getSession.execute(), null);
  unsubscribe();
  console.log("PASS: sign-out clears session and notifies subscribers");

  const error = new AdminAuthError("MFA_REQUIRED", "MFA is required");
  assert.equal(error.name, "AdminAuthError");
  assert.equal(error.code, "MFA_REQUIRED");
  console.log("PASS: typed authentication errors expose name and code");

  console.log("\nAll admin authentication contract tests passed.");
} finally {
  await server.close();
}
