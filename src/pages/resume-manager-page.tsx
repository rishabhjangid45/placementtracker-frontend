import { useState, useCallback, useRef, type FormEvent, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { useMyResumes, useUploadResume, useAtsScore } from "@/hooks/use-resume";
import { resumeService } from "@/services/resume.service";
import { useAuthContext } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ResumeRecord } from "@/types/resume";
import { ThemeToggle } from "@/components/theme-toggle";

export function ResumeManagerPage() {
  const { logout } = useAuthContext();

  return (
    <div className="min-h-screen bg-background animate-page-enter">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-lg font-bold text-foreground transition-colors hover:text-foreground/80"
          >
            Placement Tracker
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-2 sm:flex">
              <Button
                variant="ghost"
                size="sm"
                className="bg-background/30 border border-border/30 shadow-sm backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background/50 hover:border-border/50 transition-all"
                asChild
              >
                <Link to="/">Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-background/30 border border-border/30 shadow-sm backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background/50 hover:border-border/50 transition-all"
                asChild
              >
                <Link to="/jobs">Jobs</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-background/80 border border-border/80 shadow-sm backdrop-blur-sm text-foreground font-medium hover:bg-background/95 transition-all"
                asChild
              >
                <Link to="/resume">Resume</Link>
              </Button>
            </nav>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Resume Manager</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload resumes and check ATS compatibility against job descriptions.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <UploadSection />
            <AtsScoreSection />
          </div>
          <ResumeHistorySection />
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section 1 — File Upload
// ═══════════════════════════════════════════════════════════════════════════

function UploadSection() {
  const uploadMutation = useUploadResume();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback((file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or Word document.");
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    try {
      await uploadMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      // error handled by mutation state
    }
  }, [selectedFile, uploadMutation]);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Upload Resume
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          PDF or Word documents up to 5 MB
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragActive
              ? "border-indigo-500 bg-indigo-500/5"
              : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
              dragActive
                ? "bg-indigo-500/10 text-indigo-500"
                : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          {selectedFile ? (
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)} — Click to change
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop your resume here or{" "}
                <span className="text-indigo-600 dark:text-indigo-400">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOC, DOCX
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            aria-label="Upload resume file"
          />
        </div>

        {/* Upload button + status */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={!selectedFile || uploadMutation.isPending}
            onClick={handleUpload}
            className="w-full sm:w-auto"
          >
            {uploadMutation.isPending ? "Uploading…" : "Upload"}
          </Button>

          {uploadMutation.isSuccess && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              ✓ Upload successful
            </span>
          )}

          {uploadMutation.isError && (
            <span className="text-xs font-medium text-destructive">
              {extractErrorMessage(uploadMutation.error)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section 2 — ATS Score Checker
// ═══════════════════════════════════════════════════════════════════════════

function AtsScoreSection() {
  const { data: resumes, isLoading: resumesLoading } = useMyResumes();
  const atsMutation = useAtsScore();

  const [selectedResumeId, setSelectedResumeId] = useState<number | "">("");
  const [jobDescription, setJobDescription] = useState("");

  const canSubmit =
    selectedResumeId !== "" && jobDescription.trim().length >= 20 && !atsMutation.isPending;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      atsMutation.mutate({
        resumeId: selectedResumeId as number,
        jobDescription: jobDescription.trim(),
      });
    },
    [canSubmit, selectedResumeId, jobDescription, atsMutation]
  );

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          ATS Score Checker
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Check how well your resume matches a job description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Resume selector */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ats-resume" className="text-sm font-medium text-foreground">
              Select Resume
            </Label>
            <div className="relative">
              <select
                id="ats-resume"
                value={selectedResumeId}
                onChange={(e) =>
                  setSelectedResumeId(e.target.value ? Number(e.target.value) : "")
                }
                disabled={resumesLoading || !resumes?.length}
                className={cn(
                  "w-full cursor-pointer appearance-none rounded-md border border-border bg-transparent py-2 pl-3 pr-8 text-sm transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  selectedResumeId ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <option value="">
                  {resumesLoading
                    ? "Loading resumes…"
                    : resumes?.length
                      ? "Choose a resume…"
                      : "No resumes uploaded yet"}
                </option>
                {resumes?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fileName} — {formatDate(r.uploadDate)}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Job description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ats-jd" className="text-sm font-medium text-foreground">
              Job Description
            </Label>
            <Textarea
              id="ats-jd"
              placeholder="Paste the full job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="min-h-32 resize-y"
            />
            <p className="text-xs text-muted-foreground">
              {jobDescription.trim().length < 20
                ? `At least 20 characters required (${jobDescription.trim().length}/20)`
                : `${jobDescription.trim().length} characters`}
            </p>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!canSubmit}
            className="w-full sm:w-auto sm:self-end"
          >
            {atsMutation.isPending ? "Analyzing…" : "Check ATS Score"}
          </Button>
        </form>

        {/* ── Error ────────────────────────────────────────────── */}
        {atsMutation.isError && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {extractErrorMessage(atsMutation.error)}
          </div>
        )}

        {/* ── Result ───────────────────────────────────────────── */}
        {atsMutation.isSuccess && typeof atsMutation.data === "number" && (
          <AtsResult score={atsMutation.data} />
        )}
      </CardContent>
    </Card>
  );
}

// ── ATS Result Display ──────────────────────────────────────────────────────

function AtsResult({ score }: { score: number }) {
  const scoreColor =
    score >= 80
      ? "#22c55e"
      : score >= 60
        ? "#f59e0b"
        : "#ef4444";

  const radialData = [{ name: "Score", value: score, fill: scoreColor }];

  return (
    <div className="mt-6 flex flex-col gap-5 rounded-lg border border-border bg-muted/30 p-5">
      {/* ── Gauge Chart ────────────────────────────────────────── */}
      <div className="flex items-center justify-center">
        <div className="relative h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              data={radialData}
              barSize={14}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: "var(--color-muted)" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: scoreColor }}>
              {score.toFixed(2)}%
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              ATS Score
            </span>
          </div>
        </div>
      </div>

      {/* ── Verdict label ──────────────────────────────────────── */}
      <p
        className={cn(
          "text-center text-sm font-semibold",
          score >= 80
            ? "text-green-600 dark:text-green-400"
            : score >= 60
              ? "text-amber-600 dark:text-amber-400"
              : "text-red-600 dark:text-red-400"
        )}
      >
        {score >= 80
          ? "Excellent match!"
          : score >= 60
            ? "Good match — room for improvement"
            : "Low match — consider revising"}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section 3 — Resume History
// ═══════════════════════════════════════════════════════════════════════════

function ResumeHistorySection() {
  const { data: resumes, isLoading, error } = useMyResumes();

  return (
    <Card className="border-border h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Resume History
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {resumes
            ? `${resumes.length} resume${resumes.length !== 1 ? "s" : ""} uploaded`
            : "Your uploaded resumes"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <ResumeListSkeleton />}

        {error && (
          <p className="text-sm text-destructive">
            Failed to load resumes: {(error as Error).message}
          </p>
        )}

        {resumes && resumes.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-muted-foreground/40"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm text-muted-foreground">
              No resumes yet — upload one to get started.
            </p>
          </div>
        )}

        {resumes && resumes.length > 0 && (
          <ul className="flex flex-col gap-3">
            {resumes.map((r) => (
              <ResumeListItem key={r.id} resume={r} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ResumeListItem({ resume }: { resume: ResumeRecord }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await resumeService.download(resume.id, resume.fileName);
    } catch (err) {
      console.error(err);
      alert("Failed to download resume.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60">
      {/* File icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {resume.fileName}
          </p>
          {resume.lastAtsScore !== null && typeof resume.lastAtsScore === "number" && (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                resume.lastAtsScore >= 80
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : resume.lastAtsScore >= 60
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "bg-red-500/10 text-red-700 dark:text-red-400"
              )}
            >
              {resume.lastAtsScore.toFixed(2)}%
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(resume.uploadDate)}
        </p>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        aria-label={`Download ${resume.fileName}`}
      >
        {isDownloading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
      </button>
    </li>
  );
}

function ResumeListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
    return axiosErr.response?.data?.message ?? axiosErr.message ?? "An unexpected error occurred";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}
