/**
 * Job application types.
 * Source: JobApplicationDTO.java
 */

export type { ApplicationStatus } from "@/types/portfolio";
import type { ApplicationStatus } from "@/types/portfolio";

/**
 * A single job application record from GET /api/jobs/my-jobs.
 */
export interface JobApplication {
  id: number;
  companyName: string;
  role: string;
  status: ApplicationStatus;
  applicationDate: string; // ISO date "YYYY-MM-DD"
}

/**
 * Payload for POST /api/jobs/add.
 */
export interface AddJobPayload {
  companyName: string;
  role: string;
  applicationDate: string; // "YYYY-MM-DD"
  status: ApplicationStatus;
}

/**
 * Payload for PATCH /api/jobs/{jobId}/status.
 */
export interface UpdateJobStatusPayload {
  status: ApplicationStatus;
}
