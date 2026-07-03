import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/job.service";
import type { JobApplication } from "@/types/job";
import type { ApplicationStatus } from "@/types/portfolio";

const JOBS_QUERY_KEY = ["jobs", "my-jobs"] as const;

/**
 * Hook to fetch the authenticated user's job applications.
 * Backend source: JobApplicationController.java — GET /api/jobs/my-jobs
 */
export function useMyJobs() {
  return useQuery({
    queryKey: JOBS_QUERY_KEY,
    queryFn: jobService.getMyJobs,
  });
}

/**
 * Hook to update a job application's status with optimistic updates.
 *
 * Optimistic flow:
 * 1. Cancel any in-flight queries for the jobs list.
 * 2. Snapshot the current cache.
 * 3. Optimistically write the new status into the cache immediately.
 * 4. If the mutation fails, roll back to the snapshot.
 * 5. On settle (success or fail), refetch to reconcile with the server.
 */
export function useUpdateJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: number; status: ApplicationStatus }) =>
      jobService.updateStatus(jobId, status),

    onMutate: async ({ jobId, status }) => {
      // 1. Cancel in-flight fetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: JOBS_QUERY_KEY });

      // 2. Snapshot the previous value for rollback
      const previousJobs = queryClient.getQueryData<JobApplication[]>(JOBS_QUERY_KEY);

      // 3. Optimistically update the cache
      queryClient.setQueryData<JobApplication[]>(JOBS_QUERY_KEY, (old) =>
        old?.map((job) =>
          job.id === jobId ? { ...job, status } : job
        )
      );

      return { previousJobs };
    },

    onError: (_error, _variables, context) => {
      // 4. Roll back on failure
      if (context?.previousJobs) {
        queryClient.setQueryData(JOBS_QUERY_KEY, context.previousJobs);
      }
    },

    onSettled: () => {
      // 5. Always refetch to reconcile with server truth
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      // Also invalidate the dashboard summary since pipeline counts may have changed
      queryClient.invalidateQueries({ queryKey: ["portfolio", "summary"] });
    },
  });
}
