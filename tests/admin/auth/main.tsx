import { createRoot } from "react-dom/client";
import type { AdminAuthRepository } from "../../../src/application/repositories/AdminAuthRepository";
import type { AdminAuthorizationRepository } from "../../../src/application/repositories/AdminAuthorizationRepository";
import type { AdminSession } from "../../../src/domain/auth/AdminSession";
import { AdminAuthProvider, useAdminAuth } from "../../../src/admin/auth/AdminAuthProvider";
import { AdminAuthGate } from "../../../src/admin/auth/AdminAuthGate";
import "../../../src/admin/styles/admin-tokens.css";
import "../../../src/admin/styles/admin.css";

const params = new URLSearchParams(window.location.search);
const scenario = params.get("scenario") || "unauthenticated";

const session: AdminSession = {
  identity: { id: "fake-admin-id", email: "admin@example.test" },
  expiresAt: Date.now() + 60_000,
  assuranceLevel: "aal1",
};

let authListener: ((value: AdminSession | null) => void) | null = null;
let authorizationResolvers: Array<(value: boolean) => void> = [];

const repository: AdminAuthRepository = {
  async signInWithPassword(email, password) {
    if (email !== "admin@example.test" || password !== "correct-password") {
      throw new Error("Invalid credentials");
    }
    return session;
  },
  async getCurrentSession() {
    if (scenario === "restore-error") throw new Error("Restore failed");
    if (scenario === "loading") {
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    return scenario === "authenticated" ||
      scenario === "loading" ||
      scenario === "forbidden" ||
      scenario === "authorization-error"
      ? session
      : null;
  },
  async signOut() {
    authListener?.(null);
  },
  subscribeToAuthChanges(listener) {
    if (scenario === "subscription-error") throw new Error("Subscription failed");
    authListener = listener;
    return () => {
      authListener = null;
    };
  },
};

const authorizationRepository: AdminAuthorizationRepository = {
  async isActiveAdmin() {
    if (scenario === "authorization-race") {
      return new Promise<boolean>((resolve) => authorizationResolvers.push(resolve));
    }
    if (scenario === "authorization-error") {
      throw new Error("Authorization verification failed");
    }
    return scenario !== "forbidden";
  },
};

function AuthFixture() {
  const auth = useAdminAuth();

  return (
    <main className="admin-app" data-testid="auth-fixture">
      <output data-testid="auth-status">{auth.status}</output>
      <button type="button" data-testid="emit-session" onClick={() => authListener?.(session)}>
        Emit session
      </button>
      <button type="button" data-testid="emit-null" onClick={() => authListener?.(null)}>
        Emit signed out
      </button>
      <button
        type="button"
        data-testid="resolve-authorization"
        onClick={() => authorizationResolvers.shift()?.(true)}
      >
        Resolve authorization
      </button>
      <AdminAuthGate>
        <section data-testid="protected-admin">
          <h1>Protected Admin Content</h1>
          <p data-testid="identity">{auth.session?.identity.email}</p>
          <button type="button" data-testid="sign-out" onClick={() => void auth.signOut()}>
            Sign out
          </button>
        </section>
      </AdminAuthGate>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <AdminAuthProvider repository={repository} authorizationRepository={authorizationRepository}>
    <AuthFixture />
  </AdminAuthProvider>,
);
