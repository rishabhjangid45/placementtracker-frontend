import { useState, useCallback, useMemo, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMyJobs, useUpdateJobStatus } from "@/hooks/use-jobs";
import { useAuthContext } from "@/contexts/auth-context";
import { jobService } from "@/services/job.service";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/portfolio";

// ── Status metadata ─────────────────────────────────────────────────────────
const ALL_STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "OA",
  "INTERVIEW",
  "REJECTED",
  "SELECTED",
];

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; dotClass: string; selectClass: string }
> = {
  APPLIED: {
    label: "Applied",
    dotClass: "bg-indigo-500",
    selectClass: "text-indigo-600 dark:text-indigo-400",
  },
  OA: {
    label: "Online Assessment",
    dotClass: "bg-amber-500",
    selectClass: "text-amber-600 dark:text-amber-400",
  },
  INTERVIEW: {
    label: "Interviewing",
    dotClass: "bg-blue-500",
    selectClass: "text-blue-600 dark:text-blue-400",
  },
  REJECTED: {
    label: "Rejected",
    dotClass: "bg-red-500",
    selectClass: "text-red-600 dark:text-red-400",
  },
  SELECTED: {
    label: "Selected / Offered",
    dotClass: "bg-green-500",
    selectClass: "text-green-600 dark:text-green-400",
  },
};

// ── Page ────────────────────────────────────────────────────────────────────
export function JobTrackerPage() {
  const { data: jobs, isLoading, error } = useMyJobs();
  const { logout } = useAuthContext();
  const updateStatus = useUpdateJobStatus();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status")?.toUpperCase();

  const [showAddForm, setShowAddForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [applicationDate, setApplicationDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [status, setStatus] = useState<ApplicationStatus>("APPLIED");

  const addJobMutation = useMutation({
    mutationFn: jobService.addJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", "summary"] });
      setCompanyName("");
      setRole("");
      setApplicationDate(new Date().toISOString().split("T")[0]);
      setStatus("APPLIED");
      setShowAddForm(false);
    },
  });

  const handleStatusChange = useCallback(
    (jobId: number, newStatus: ApplicationStatus) => {
      updateStatus.mutate({ jobId, status: newStatus });
    },
    [updateStatus]
  );

  const handleAddSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!companyName.trim() || !role.trim() || !applicationDate) return;
      addJobMutation.mutate({
        companyName: companyName.trim(),
        role: role.trim(),
        applicationDate,
        status,
      });
    },
    [companyName, role, applicationDate, status, addJobMutation]
  );

  // Compute filtered jobs list
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    if (!statusFilter) return jobs;
    return jobs.filter((job) => job.status?.toUpperCase() === statusFilter);
  }, [jobs, statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-lg font-bold text-foreground transition-colors hover:text-foreground/80"
          >
            Placement Tracker
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-1 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground font-medium" asChild>
                <Link to="/jobs">Jobs</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/resume">Resume</Link>
              </Button>
            </nav>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Job Tracker</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and track your job applications.
            </p>
          </div>

          <Button onClick={() => setShowAddForm((p) => !p)} size="sm">
            {showAddForm ? "Cancel" : "Add Application"}
          </Button>
        </div>

        {/* Add Job Form */}
        {showAddForm && (
          <Card className="border-border mb-6 max-w-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">New Application</CardTitle>
              <CardDescription>Enter details of the job application.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-company">Company Name</Label>
                  <Input
                    id="add-company"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-role">Role</Label>
                  <Input
                    id="add-role"
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-date">Application Date</Label>
                  <Input
                    id="add-date"
                    type="date"
                    required
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-status">Status</Label>
                  <div className="relative">
                    <select
                      id="add-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                      className="w-full cursor-pointer appearance-none rounded-md border border-border bg-transparent py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring text-foreground"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_CONFIG[s].label}
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

                <Button type="submit" size="sm" className="w-fit" disabled={addJobMutation.isPending}>
                  {addJobMutation.isPending ? "Adding..." : "Add"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Active Filter Banner */}
        {statusFilter && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-indigo-500/10 px-3 py-1.5 text-sm text-indigo-700 dark:text-indigo-400 w-fit">
            <span>Showing only <strong>{STATUS_CONFIG[statusFilter as ApplicationStatus]?.label || statusFilter}</strong> applications</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchParams({})}
              className="h-6 px-1.5 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-semibold"
            >
              Clear filter
            </Button>
          </div>
        )}

        {/* ── States ─────────────────────────────────────────────── */}
        {isLoading && <JobTableSkeleton />}
        {error && <JobTableError message={(error as Error).message} />}
        {jobs && jobs.length === 0 && <JobTableEmpty />}
        {jobs && jobs.length > 0 && (
          <JobTable
            jobs={filteredJobs}
            onStatusChange={handleStatusChange}
            isUpdating={updateStatus.isPending}
          />
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Job Table
// ═══════════════════════════════════════════════════════════════════════════

interface JobTableProps {
  jobs: ReturnType<typeof useMyJobs>["data"] & object[];
  onStatusChange: (jobId: number, status: ApplicationStatus) => void;
  isUpdating: boolean;
}

function JobTable({ jobs, onStatusChange }: JobTableProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.APPLIED;
              return (
                <TableRow key={job.id}>
                  {/* Company */}
                  <TableCell className="font-medium text-foreground">
                    {job.companyName}
                  </TableCell>

                  {/* Role */}
                  <TableCell className="text-muted-foreground">
                    {job.role}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-muted-foreground">
                    {formatDate(job.applicationDate)}
                  </TableCell>

                  {/* Status dropdown */}
                  <TableCell>
                    <div className="relative inline-flex items-center">
                      <span
                        className={cn(
                          "pointer-events-none absolute left-2.5 h-2 w-2 rounded-full",
                          config.dotClass
                        )}
                      />
                      <select
                        value={job.status}
                        onChange={(e) =>
                          onStatusChange(job.id, e.target.value as ApplicationStatus)
                        }
                        aria-label={`Status for ${job.companyName} — ${job.role}`}
                        className={cn(
                          "cursor-pointer appearance-none rounded-md border border-border bg-transparent py-1.5 pl-7 pr-8 text-sm font-medium transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                          "hover:bg-muted/60",
                          config.selectClass
                        )}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_CONFIG[s].label}
                          </option>
                        ))}
                      </select>
                      {/* Chevron icon */}
                      <svg
                        className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground"
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Loading / Empty / Error states
// ═══════════════════════════════════════════════════════════════════════════

function JobTableSkeleton() {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function JobTableEmpty() {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center gap-3 py-16">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-muted-foreground/40"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
        <p className="text-sm font-medium text-muted-foreground">
          No job applications yet
        </p>
        <p className="text-xs text-muted-foreground/70">
          Start by adding your first application.
        </p>
      </CardContent>
    </Card>
  );
}

function JobTableError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-destructive">
          Failed to load applications
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
