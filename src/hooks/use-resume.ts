import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "@/services/resume.service";
import type { AtsScoreRequest } from "@/types/resume";

const RESUMES_QUERY_KEY = ["resume", "my-resumes"] as const;

/**
 * Hook to fetch the authenticated user's resume history.
 * Backend source: ResumeController.java — GET /api/resume/my-resumes
 */
export function useMyResumes() {
  return useQuery({
    queryKey: RESUMES_QUERY_KEY,
    queryFn: resumeService.getMyResumes,
  });
}

/**
 * Hook to upload a resume file.
 * Invalidates both the resume list and the portfolio summary on success.
 */
export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => resumeService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["portfolio", "summary"] });
    },
  });
}

/**
 * Hook to score a resume against a job description.
 * Backend source: AtsController.java — POST /api/ats/score
 */
export function useAtsScore() {
  return useMutation({
    mutationFn: (payload: AtsScoreRequest) => resumeService.getAtsScore(payload),
  });
}
