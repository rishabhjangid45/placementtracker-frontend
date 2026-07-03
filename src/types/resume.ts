/**
 * Resume types for upload, listing, and ATS scoring.
 */

/**
 * Resume record from GET /api/resume/my-resumes.
 */
export interface ResumeRecord {
  id: number;
  fileName: string;
  uploadDate: string; // ISO datetime
  lastAtsScore: number;
}

/**
 * Payload for POST /api/ats/score.
 */
export interface AtsScoreRequest {
  resumeId: number;
  jobDescription: string;
}

/**
 * Response from POST /api/ats/score — just a number (percentage).
 */
export type AtsScoreResponse = number;
