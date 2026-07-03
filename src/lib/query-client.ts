import { QueryClient } from "@tanstack/react-query";

/**
 * Centralized React Query client with sensible defaults.
 *
 * - staleTime: 5 minutes — avoids unnecessary refetches for fresh data
 * - retry: 1 — retries failed requests once before surfacing the error
 * - refetchOnWindowFocus: false — prevents surprise refetches when tabbing back
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
