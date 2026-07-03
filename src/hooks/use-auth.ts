import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";

/**
 * Hook for authentication operations.
 * Provides React Query mutations for login, register, and logout.
 */
export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) =>
      authService.login(credentials),
    onSuccess: () => {
      // Invalidate all queries so protected data re-fetches with the new token
      queryClient.invalidateQueries();
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterRequest) =>
      authService.register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const logout = () => {
    queryClient.clear();
    authService.logout();
  };

  return {
    login: loginMutation.mutateAsync,
    loginStatus: {
      isLoading: loginMutation.isPending,
      error: (loginMutation.error as AxiosError<ApiErrorResponse>)?.response
        ?.data?.message ?? loginMutation.error?.message ?? null,
    },
    register: registerMutation.mutateAsync,
    registerStatus: {
      isLoading: registerMutation.isPending,
      error: (registerMutation.error as AxiosError<ApiErrorResponse>)?.response
        ?.data?.message ?? registerMutation.error?.message ?? null,
    },
    logout,
    isAuthenticated: authService.isAuthenticated(),
  };
}
