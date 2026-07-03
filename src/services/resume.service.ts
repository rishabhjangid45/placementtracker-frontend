import { api } from "@/lib/api";
import type { ResumeRecord, AtsScoreRequest, AtsScoreResponse } from "@/types/resume";

/**
 * Resume service — upload, list, and ATS scoring.
 * Backend: ResumeController.java, AtsController.java
 */
export const resumeService = {
  /**
   * POST /api/resume/upload
   * Uploads a resume file using multipart/form-data.
   */
  async upload(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);

    await api.post("/api/resume/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * GET /api/resume/my-resumes
   */
  async getMyResumes(): Promise<ResumeRecord[]> {
    const { data } = await api.get<ResumeRecord[]>("/api/resume/my-resumes");
    return data;
  },

  /**
   * POST /api/ats/score
   * Returns a plain number (percentage score).
   */
  async getAtsScore(payload: AtsScoreRequest): Promise<AtsScoreResponse> {
    const { data } = await api.post<AtsScoreResponse>("/api/ats/score", payload);
    return data;
  },

  /**
   * GET /api/resume/download/{id}
   * Downloads a resume as a binary blob.
   */
  async download(id: number, fileName: string): Promise<void> {
    const response = await api.get(`/api/resume/download/${id}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
