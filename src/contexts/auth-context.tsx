import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/types/auth";

// ── Context shape ───────────────────────────────────────────────────────────
interface AuthContextValue {
  /** Whether the user is authenticated (has a valid token in storage). */
  isAuthenticated: boolean;
  /** Whether an auth operation (login/register) is in progress. */
  isLoading: boolean;
  /** The most recent auth error message, if any. */
  error: string | null;
  /** Log in with email + password. Resolves with the auth response. */
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  /** Register a new account. Resolves with the auth response. */
  register: (payload: RegisterRequest) => Promise<AuthResponse>;
  /** Clear tokens and redirect to /login. */
  logout: () => void;
  /** Dismiss the current error. */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    authService.isAuthenticated()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.login(credentials);
        setIsAuthenticated(true);
        queryClient.invalidateQueries();
        return response;
      } catch (err: unknown) {
        const message = extractErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.register(payload);
        setIsAuthenticated(true);
        queryClient.invalidateQueries();
        return response;
      } catch (err: unknown) {
        const message = extractErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    queryClient.clear();
    setIsAuthenticated(false);
    setError(null);
    authService.logout();
  }, [queryClient]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [isAuthenticated, isLoading, error, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ────────────────────────────────────────────────────────────────────
/**
 * Access the AuthContext. Must be used within an `<AuthProvider>`.
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an <AuthProvider>");
  }
  return ctx;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
    return axiosErr.response?.data?.message ?? axiosErr.message ?? "An unexpected error occurred";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}
