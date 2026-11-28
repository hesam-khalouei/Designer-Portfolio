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
  const requestGeneration = useRef(0);

  const checkAccess = useCallback(
    async (nextSession: AdminSession | null) => {
      if (!nextSession) return false;
      return new CheckAdminAccess(authorizationRepository).execute();
    },
    [authorizationRepository],
  );

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    const restoreRequestId = ++requestGeneration.current;

    const applySession = async (nextSession: AdminSession | null, requestId: number) => {
      try {
        const allowed = await checkAccess(nextSession);

        if (!active || requestGeneration.current !== requestId) return;

        setSession(nextSession);
        setStatus(nextSession ? (allowed ? "authenticated" : "forbidden") : "unauthenticated");
        setError(null);
      } catch (cause) {
        if (!active || requestGeneration.current !== requestId) return;

        setSession(null);
        setStatus("error");
        setError(cause instanceof Error ? cause : new Error("Authorization check failed"));
      }
    };

    try {
      unsubscribe = repository.subscribeToAuthChanges((nextSession) => {
        if (!active) return;

        const requestId = ++requestGeneration.current;
        void applySession(nextSession, requestId);
      });
    } catch (cause) {
      if (requestGeneration.current === restoreRequestId) {
        ++requestGeneration.current;
        setSession(null);
        setStatus("error");
        setError(cause instanceof Error ? cause : new Error("Auth subscription failed"));
      }

      return () => {
        active = false;
      };
    }

    void new GetAdminSession(repository)
      .execute()
      .then(async (restoredSession) => {
        if (!active || requestGeneration.current !== restoreRequestId) return;
        await applySession(restoredSession, restoreRequestId);
      })
      .catch((cause: unknown) => {
        if (!active || requestGeneration.current !== restoreRequestId) return;

        setSession(null);
        setStatus("error");
        setError(cause instanceof Error ? cause : new Error("Session restoration failed"));
      });

    return () => {
      active = false;
      ++requestGeneration.current;
      unsubscribe();
    };
  }, [repository, checkAccess]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const requestId = ++requestGeneration.current;
      setError(null);

      let nextSession: AdminSession;

      try {
        nextSession = await new SignInAdmin(repository).execute(email, password);
      } catch (cause) {
        const authError = cause instanceof Error ? cause : new Error("Sign-in failed");

        if (requestGeneration.current === requestId) {
          setSession(null);
          setStatus("unauthenticated");
          setError(authError);
        }

        throw authError;
      }

      if (requestGeneration.current !== requestId) return;

      try {
        const allowed = await checkAccess(nextSession);

        if (requestGeneration.current !== requestId) return;

        setSession(nextSession);
        setStatus(allowed ? "authenticated" : "forbidden");
        setError(null);
      } catch (cause) {
        if (requestGeneration.current !== requestId) return;

        const authorizationError =
          cause instanceof Error ? cause : new Error("Authorization check failed");

        setSession(null);
        setStatus("error");
        setError(authorizationError);
        throw authorizationError;
      }
    },
    [repository, checkAccess],
  );

  const signOut = useCallback(async () => {
    const requestId = ++requestGeneration.current;
    setError(null);

    try {
      await new SignOutAdmin(repository).execute();

      if (requestGeneration.current !== requestId) return;

      setSession(null);
      setStatus("unauthenticated");
      setError(null);
    } catch (cause) {
      const authError = cause instanceof Error ? cause : new Error("Sign-out failed");

      if (requestGeneration.current === requestId) {
        setError(authError);
      }

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
