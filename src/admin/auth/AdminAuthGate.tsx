import type { ReactNode } from "react";
import { useAdminAuth } from "./AdminAuthProvider";
import { AdminLoginPage } from "./AdminLoginPage";

interface AdminAuthGateProps {
  children: ReactNode;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const { status, signOut } = useAdminAuth();

  if (status === "loading") {
    return (
      <main className="admin-auth-loading" aria-live="polite">
        <p>Restoring admin session...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main role="alert">
        <p>Unable to verify administrator access. Please try again later.</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <AdminLoginPage />;
  }

  if (status === "forbidden") {
    return (
      <main role="alert" className="admin-auth-forbidden">
        <h1>Access denied</h1>
        <p>Your account is not authorized to access the admin panel.</p>
        <button type="button" onClick={() => void signOut()}>
          Sign out
        </button>
      </main>
    );
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return (
    <main role="alert">
      <p>Administrator access is unavailable.</p>
    </main>
  );
}
