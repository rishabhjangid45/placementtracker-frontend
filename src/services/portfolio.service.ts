import { api } from "@/lib/api";
import type { PortfolioSummary } from "@/types/portfolio";

/**
 * Portfolio service — fetches the dashboard summary.
 * Backend source: PortfolioController.java
 */
export const portfolioService = {
  /**
   * GET /api/portfolio/summary
   * Returns coding stats, job pipeline, and latest resume info.
   */
  async getSummary(): Promise<PortfolioSummary> {
    const { data } = await api.get<PortfolioSummary>("/api/dashboard/stats");
    return data;
  },

  /**
   * GET /api/sync/leetcode/{username}
   * Syncs LeetCode stats for the given username.
   */
  async syncLeetCode(username: string): Promise<string> {
    const { data } = await api.get<string>(`/api/sync/leetcode/${username}`);
    return data;
  },
};
