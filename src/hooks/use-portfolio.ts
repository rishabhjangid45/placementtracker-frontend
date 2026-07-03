import { useQuery } from "@tanstack/react-query";
import { portfolioService } from "@/services/portfolio.service";

/**
 * Hook to fetch the portfolio summary for the dashboard.
 * Backend source: PortfolioController.java
 */
export function usePortfolioSummary() {
  return useQuery({
    queryKey: ["portfolio", "summary"],
    queryFn: portfolioService.getSummary,
  });
}
