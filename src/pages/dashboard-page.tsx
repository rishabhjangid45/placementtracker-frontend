import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { usePortfolioSummary } from "@/hooks/use-portfolio";
import { useMyJobs } from "@/hooks/use-jobs";
import { useMyResumes } from "@/hooks/use-resume";
import { portfolioService } from "@/services/portfolio.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JobStats } from "@/types/portfolio";
import { Navbar } from "@/components/navbar";


// ── Color constants for Recharts ──────────────────────────────────────────
const COLORS = {
  applied: "#6366f1",    // Indigo
  oa: "#f59e0b",         // Amber
  interview: "#3b82f6",  // Blue
} as const;

export function DashboardPage() {
  const { data, isLoading, error } = usePortfolioSummary();
  const { data: jobs } = useMyJobs();
  const { data: resumes } = useMyResumes();

  // Compute job stats directly from the job list (source of truth)
  const computedJobStats = useMemo(() => {
    const stats = { APPLIED: 0, OA: 0, INTERVIEW: 0, REJECTED: 0, SELECTED: 0 };
    if (!jobs) return stats;
    jobs.forEach((job) => {
      const status = job.status?.toUpperCase();
      if (status === "APPLIED") stats.APPLIED++;
      else if (status === "OA") stats.OA++;
      else if (status === "INTERVIEW") stats.INTERVIEW++;
      else if (status === "REJECTED") stats.REJECTED++;
      else if (status === "SELECTED") stats.SELECTED++;
    });
    return stats;
  }, [jobs]);

  // Compute the most recently uploaded resume from the list (source of truth)
  const latestResumeFileName = useMemo(() => {
    if (!resumes || resumes.length === 0) return null;
    const sorted = [...resumes].sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
    return sorted[0]?.fileName || null;
  }, [resumes]);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError message={(error as Error).message} />;
  if (!data) return null;

  // Log the exact response from the backend to easily diagnose key mismatches
  console.log("Dashboard stats response data:", data);

  // Fallbacks for common variations of coding stats key names
  const totalSolvedCount =
    data.totalSolved ??
    (data as any).solvedCount ??
    (data as any).solved ??
    (data as any).totalQuestions ??
    0;

  const streakCount =
    data.currentStreak ??
    (data as any).streak ??
    (data as any).streakCount ??
    (data as any).codingStreak ??
    0;

  return (
    <div className="min-h-screen bg-background animate-page-enter">
      <Navbar />

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {data.name || "User"}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is your placement preparation and job tracking summary.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <CodingStatsCard totalSolved={totalSolvedCount} currentStreak={streakCount} />
          <JobPipelineCard jobStats={computedJobStats} />
          <ResumeCard fileName={latestResumeFileName || data.resumeFileName} />
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CARD 1 — Coding Stats
// ═══════════════════════════════════════════════════════════════════════════
interface CodingStatsCardProps {
  totalSolved: number;
  currentStreak: number;
}

function CodingStatsCard({ totalSolved, currentStreak }: CodingStatsCardProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [leetcode, setLeetcode] = useState("");
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number>(0);
  const [savedUsername, setSavedUsername] = useState<string | null>(() =>
    localStorage.getItem("leetcodeUsername")
  );

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: portfolioService.syncLeetCode,
    onSuccess: (_, username) => {
      // Invalidate query to fetch new stats
      queryClient.invalidateQueries({ queryKey: ["portfolio", "summary"] });
      // Persist the synced username for future one-click refreshes
      localStorage.setItem("leetcodeUsername", username);
      setSavedUsername(username);
      // Set 15 min cooldown timestamp in localStorage
      localStorage.setItem("lastLeetcodeSyncTime", Date.now().toString());
      setCooldownTimeLeft(15 * 60); // 15 mins
      setIsEditing(false);
      setLeetcode("");
    },
  });

  // Check cooldown timer on mount and every second
  useEffect(() => {
    const checkCooldown = () => {
      const lastSync = localStorage.getItem("lastLeetcodeSyncTime");
      if (lastSync) {
        const diff = Date.now() - Number(lastSync);
        const cooldownMs = 15 * 60 * 1000;
        if (diff < cooldownMs) {
          setCooldownTimeLeft(Math.ceil((cooldownMs - diff) / 1000));
        } else {
          setCooldownTimeLeft(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leetcode.trim()) return;
    syncMutation.mutate(leetcode.trim());
  };

  const handleRefreshClick = () => {
    if (!savedUsername || cooldownTimeLeft > 0 || syncMutation.isPending) return;
    syncMutation.mutate(savedUsername);
  };

  const formatTimeLeft = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-foreground">
            LeetCode / Coding Stats
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Your practice progress and consistency.
          </CardDescription>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            {savedUsername && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground relative group cursor-pointer"
                onClick={handleRefreshClick}
                disabled={syncMutation.isPending || cooldownTimeLeft > 0}
                title={cooldownTimeLeft > 0 ? "Sync cooldown active" : "Refresh stats"}
              >
                {syncMutation.isPending ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : cooldownTimeLeft > 0 ? (
                  <span className="text-[10px] font-semibold">{formatTimeLeft(cooldownTimeLeft)}</span>
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
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8">
              {savedUsername ? "Change Account" : "Sync Account"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {isEditing ? (
          <form onSubmit={handleSyncSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="leetcode-handle" className="text-xs font-medium">LeetCode Username</Label>
              <Input
                id="leetcode-handle"
                type="text"
                required
                placeholder="e.g. janesmith"
                value={leetcode}
                onChange={(e) => setLeetcode(e.target.value)}
              />
            </div>
            {syncMutation.isError && (
              <p className="text-xs text-destructive">
                Failed to sync. Please try again.
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Button type="submit" size="sm" disabled={syncMutation.isPending}>
                {syncMutation.isPending ? "Syncing..." : "Sync Stats"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            {/* Solved Stats */}
            <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-4 border border-border">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
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
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground">{totalSolved}</span>
                <p className="text-xs text-muted-foreground">Total Problems Solved</p>
              </div>
            </div>

            {/* Streak Stats */}
            <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-4 border border-border">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                {/* Flame Icon */}
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
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground">{currentStreak}</span>
                <p className="text-xs text-muted-foreground">Current Coding Streak (Days)</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CARD 2 — Job Application Pipeline
// ═══════════════════════════════════════════════════════════════════════════

function JobPipelineCard({ jobStats }: { jobStats?: JobStats }) {
  const navigate = useNavigate();

  const barData = useMemo(() => {
    const stats = (jobStats || {}) as Record<string, number | undefined>;
    const appliedCount = stats.APPLIED ?? stats.applied ?? stats.Applied ?? 0;
    const oaCount = stats.OA ?? stats.oa ?? stats.Oa ?? 0;
    const interviewCount = stats.INTERVIEW ?? stats.interview ?? stats.Interview ?? stats.INTERVIEWING ?? stats.interviewing ?? 0;

    return [
      { stage: "Applied", count: appliedCount, color: COLORS.applied },
      { stage: "OA", count: oaCount, color: COLORS.oa },
      { stage: "Interview", count: interviewCount, color: COLORS.interview },
    ];
  }, [jobStats]);

  const totalApplications = useMemo(() => {
    const stats = (jobStats || {}) as Record<string, number | undefined>;
    const appliedCount = stats.APPLIED ?? stats.applied ?? stats.Applied ?? 0;
    const oaCount = stats.OA ?? stats.oa ?? stats.Oa ?? 0;
    const interviewCount = stats.INTERVIEW ?? stats.interview ?? stats.Interview ?? stats.INTERVIEWING ?? stats.interviewing ?? 0;
    return appliedCount + oaCount + interviewCount;
  }, [jobStats]);

  const handleChartClick = (state: any) => {
    if (state && state.activeLabel) {
      const statusMap: Record<string, string> = {
        Applied: "APPLIED",
        OA: "OA",
        Interview: "INTERVIEW",
      };
      const status = statusMap[state.activeLabel];
      if (status) {
        navigate(`/jobs?status=${status}`);
      }
    }
  };

  const handleBadgeClick = (stage: string) => {
    const statusMap: Record<string, string> = {
      Applied: "APPLIED",
      OA: "OA",
      Interview: "INTERVIEW",
    };
    const status = statusMap[stage];
    if (status) {
      navigate(`/jobs?status=${status}`);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Job Application Pipeline
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {totalApplications} active applications in process
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Bar chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              barCategoryGap="25%"
              onClick={handleChartClick}
              className="cursor-pointer"
            >
              <XAxis
                dataKey="stage"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-popover-foreground)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((entry) => (
                  <Cell
                    key={entry.stage}
                    fill={entry.color}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Stats breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {barData.map((d) => (
            <button
              key={d.stage}
              onClick={() => handleBadgeClick(d.stage)}
              className="rounded bg-muted/30 p-2 border border-border/50 text-center transition-all hover:bg-muted hover:border-border cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <span className="font-semibold block text-sm" style={{ color: d.color }}>
                {d.count}
              </span>
              <span className="text-muted-foreground">{d.stage}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CARD 3 — Recent Resume
// ═══════════════════════════════════════════════════════════════════════════
interface ResumeCardProps {
  fileName: string | null;
}

function ResumeCard({ fileName }: ResumeCardProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Recent Resume
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Your current active resume for applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fileName ? (
          <div className="flex flex-col gap-5">
            {/* File info */}
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active Resume
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/resume">Manage Resumes</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-muted-foreground/50"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-sm text-muted-foreground">
              No resume uploaded yet
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/resume">Upload Resume</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Loading & Error states
// ═══════════════════════════════════════════════════════════════════════════

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-border/50 bg-card/60 backdrop-blur-md"
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function DashboardError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive">
            Failed to load dashboard
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
