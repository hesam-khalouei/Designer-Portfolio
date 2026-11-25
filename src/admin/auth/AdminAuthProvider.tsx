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
import type { AdminAuthorizationRepository } from "../../application/repositories/AdminAuthorizationRepository";
import { CheckAdminAccess } from "../../application/use-cases/CheckAdminAccess";
import { GetAdminSession } from "../../application/use-cases/GetAdminSession";
import { SignInAdmin } from "../../application/use-cases/SignInAdmin";
import { SignOutAdmin } from "../../application/use-cases/SignOutAdmin";

export type AdminAuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "forbidden"
  | "error";

interface AdminAuthContextValue {
  status: AdminAuthStatus;
  session: AdminSession | null;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface AdminAuthProviderProps {
  repository: AdminAuthRepository;
  authorizationRepository: AdminAuthorizationRepository;
  children: ReactNode;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({
  repository,
  authorizationRepository,
  children,
}: AdminAuthProviderProps) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [status, setStatus] = useState<AdminAuthStatus>("loading");
  const [error, setError] = useState<Error | null>(null);
  const authEventReceived = useRef(false);

  const checkAccess = useCallback(async (nextSession: AdminSession | null) => {
    if (!nextSession) return false;
    return new CheckAdminAccess(authorizationRepository).execute();
  }, [authorizationRepository]);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    authEventReceived.current = false;

    const applySession = async (nextSession: AdminSession | null) => {
      try {
        const allowed = await checkAccess(nextSession);
        if (!active) return;

        setSession(nextSession);
        setStatus(
          nextSession
            ? allowed ? "authenticated" : "forbidden"
            : "unauthenticated",
        );
        setError(null);
      } catch (cause) {
        if (!active) return;
        setSession(null);
        setStatus("error");
        setError(
          cause instanceof Error
            ? cause
            : new Error("Authorization check failed"),
        );
      }
    };

    try {
      unsubscribe = repository.subscribeToAuthChanges((nextSession) => {
        authEventReceived.current = true;
        if (active) void applySession(nextSession);
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
      .then(async (restoredSession) => {
        if (!active || authEventReceived.current) return;
        await applySession(restoredSession);
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
  }, [repository, checkAccess]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      authEventReceived.current = true;
      setError(null);
      setStatus("loading");

      let nextSession: AdminSession;

      try {
        nextSession = await new SignInAdmin(repository).execute(email, password);
      } catch (cause) {
        const authError = cause instanceof Error ? cause : new Error("Sign-in failed");
        setSession(null);
        setStatus("unauthenticated");
        setError(authError);
        throw authError;
      }

      try {
        const allowed = await checkAccess(nextSession);
        setSession(nextSession);
        setStatus(allowed ? "authenticated" : "forbidden");
      } catch (cause) {
        const authorizationError = cause instanceof Error ? cause : new Error("Authorization check failed");
        setSession(null);
        setStatus("error");
        setError(authorizationError);
        throw authorizationError;
      }
    },
    [repository, checkAccess],
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

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}


