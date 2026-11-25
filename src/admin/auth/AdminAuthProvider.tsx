import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AdminSession } from "../../domain/auth/AdminSession";
import type { AdminAuthRepository } from "../../application/repositories/AdminAuthRepository";
import { GetAdminSession } from "../../application/use-cases/GetAdminSession";
import { SignInAdmin } from "../../application/use-cases/SignInAdmin";
import { SignOutAdmin } from "../../application/use-cases/SignOutAdmin";

export type AdminAuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

interface AdminAuthContextValue {
  status: AdminAuthStatus;
  session: AdminSession | null;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface AdminAuthProviderProps {
  repository: AdminAuthRepository;
  children: ReactNode;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ repository, children }: AdminAuthProviderProps) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [status, setStatus] = useState<AdminAuthStatus>("loading");
  const [error, setError] = useState<Error | null>(null);
  const authEventReceived = useRef(false);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    authEventReceived.current = false;

    try {
      unsubscribe = repository.subscribeToAuthChanges((nextSession) => {
        authEventReceived.current = true;
        if (!active) return;

        setSession(nextSession);
        setStatus(nextSession ? "authenticated" : "unauthenticated");
        setError(null);
      });
    } catch (cause) {
      setSession(null);
      setStatus("error");
      setError(cause instanceof Error ? cause : new Error("Auth subscription failed"));

      return () => {
        active = false;
      };
    }

    void new GetAdminSession(repository)
      .execute()
      .then((restoredSession) => {
        if (!active || authEventReceived.current) return;

        setSession(restoredSession);
        setStatus(restoredSession ? "authenticated" : "unauthenticated");
      })
      .catch((cause: unknown) => {
        if (!active || authEventReceived.current) return;

        setSession(null);
        setStatus("error");
        setError(cause instanceof Error ? cause : new Error("Session restoration failed"));
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [repository]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);

      try {
        const nextSession = await new SignInAdmin(repository).execute(email, password);
        setSession(nextSession);
        setStatus("authenticated");
      } catch (cause) {
        const authError = cause instanceof Error ? cause : new Error("Sign-in failed");
        setError(authError);
        throw authError;
      }
    },
    [repository],
  );

  const signOut = useCallback(async () => {
    setError(null);

    try {
      await new SignOutAdmin(repository).execute();
      setSession(null);
      setStatus("unauthenticated");
    } catch (cause) {
      const authError = cause instanceof Error ? cause : new Error("Sign-out failed");
      setError(authError);
      throw authError;
    }
  }, [repository]);

  const value = useMemo(
    () => ({ status, session, error, signIn, signOut }),
    [status, session, error, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
