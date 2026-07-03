/**
 * Portfolio summary response from GET /api/portfolio/summary.
 */
export interface PortfolioSummary {
  name: string;
  totalSolved: number;
  currentStreak: number;
  jobStats: JobStats;
  resumeFileName: string;
}

export interface JobStats {
  APPLIED: number;
  OA: number;
  INTERVIEW: number;
}

/**
 * Job status enum matching the backend.
 * Used across jobs and portfolio.
 */
export type ApplicationStatus =
  | "APPLIED"
  | "OA"
  | "INTERVIEW"
  | "REJECTED"
  | "SELECTED";
