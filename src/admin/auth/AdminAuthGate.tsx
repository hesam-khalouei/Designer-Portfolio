import type { ReactNode } from "react";
import { useAdminAuth } from "./AdminAuthProvider";
import { AdminLoginPage } from "./AdminLoginPage";

interface AdminAuthGateProps {
  children: ReactNode;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const { status } = useAdminAuth();

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
        <p>Unable to restore the admin session. Please try again later.</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <AdminLoginPage />;
  }

  return <>{children}</>;
}
