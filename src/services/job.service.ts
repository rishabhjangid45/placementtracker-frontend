import { api } from "@/lib/api";
import type { JobApplication, AddJobPayload, UpdateJobStatusPayload } from "@/types/job";
import type { ApplicationStatus } from "@/types/portfolio";

/**
 * Job application service.
 * Backend: JobApplicationController.java
 */
export const jobService = {
  /**
   * GET /api/jobs/my-jobs
   */
  async getMyJobs(): Promise<JobApplication[]> {
    const { data } = await api.get<JobApplication[]>("/api/jobs/my-jobs");
    return data;
  },

  /**
   * POST /api/jobs/add
   */
  async addJob(payload: AddJobPayload): Promise<JobApplication> {
    const { data } = await api.post<JobApplication>("/api/jobs/add", payload);
    return data;
  },

  /**
   * PATCH /api/jobs/{jobId}/status
   */
  async updateStatus(
    jobId: number,
    status: ApplicationStatus
  ): Promise<JobApplication> {
    const payload: UpdateJobStatusPayload = { status };
    const { data } = await api.patch<JobApplication>(
      `/api/jobs/${jobId}/status`,
      payload
    );
    return data;
  },
};
