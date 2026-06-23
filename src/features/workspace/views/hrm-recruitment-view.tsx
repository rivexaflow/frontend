"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  CalendarClock,
  Kanban,
  Plus,
  Target,
  UserCheck,
} from "lucide-react";

import { CrmPanel, CrmPanelHead, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { HrmDashboardRecruitmentBoard } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-recruitment-board";
import { HrmCompactBanner, HrmPanelTabs } from "@/features/workspace/components/hrm/hrm-compact-banner";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import { RecruitmentApplicantsTable } from "@/features/workspace/components/hrm/recruitment/recruitment-applicants-table";
import { RecruitmentInterviewsPanel } from "@/features/workspace/components/hrm/recruitment/recruitment-interviews-panel";
import {
  RecruitmentJobFormModal,
  type RecruitmentJobFormValues,
} from "@/features/workspace/components/hrm/recruitment/recruitment-job-form-modal";
import { RecruitmentJobCard } from "@/features/workspace/components/hrm/recruitment/recruitment-job-card";
import { RecruitmentJobDrawer } from "@/features/workspace/components/hrm/recruitment/recruitment-job-drawer";
import { RecruitmentMeetingLinkModal } from "@/features/workspace/components/hrm/recruitment/recruitment-meeting-link-modal";
import {
  RecruitmentScheduleInterviewModal,
  type ScheduleInterviewFormValues,
} from "@/features/workspace/components/hrm/recruitment/recruitment-schedule-interview-modal";
import {
  RecruitmentToolbar,
  type RecruitmentFilters,
} from "@/features/workspace/components/hrm/recruitment/recruitment-toolbar";
import type { HrmScheduleEvent } from "@/features/workspace/data/hrm-dashboard-demo";
import {
  DEMO_HRM_CANDIDATES,
  DEMO_HRM_INTERVIEWS,
  DEMO_HRM_RECRUITMENT_JOBS,
  getCandidatesForJob,
  getRecruitmentStats,
  type HrmCandidate,
  type HrmRecruitmentJob,
} from "@/features/workspace/data/hrm-recruitment-demo";

type Tab = "roles" | "pipeline" | "applicants" | "interviews";

const EMPTY_FILTERS: RecruitmentFilters = { query: "", department: "", stage: "" };

function dateIsoToDay(dateIso: string) {
  return new Date(dateIso).getDate();
}

function formatTimeLabel(time: string) {
  const [h, m] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:${m} ${suffix}`;
}

export function HrmRecruitmentView() {
  const [jobs, setJobs] = useState<HrmRecruitmentJob[]>(() => [...DEMO_HRM_RECRUITMENT_JOBS]);
  const [interviews, setInterviews] = useState<HrmScheduleEvent[]>(() => [...DEMO_HRM_INTERVIEWS]);
  const [candidates, setCandidates] = useState<HrmCandidate[]>(() => [...DEMO_HRM_CANDIDATES]);

  const stats = useMemo(() => getRecruitmentStats(jobs, interviews, candidates), [jobs, interviews, candidates]);

  const [tab, setTab] = useState<Tab>("roles");
  const [filters, setFilters] = useState<RecruitmentFilters>(EMPTY_FILTERS);
  const [applicantQuery, setApplicantQuery] = useState("");
  const [applicantStage, setApplicantStage] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [jobFormMode, setJobFormMode] = useState<"create" | "edit">("create");
  const [editingJob, setEditingJob] = useState<HrmRecruitmentJob | null>(null);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleCandidate, setScheduleCandidate] = useState<HrmCandidate | null>(null);

  const [meetingOpen, setMeetingOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<HrmScheduleEvent | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const departments = useMemo(() => [...new Set(jobs.map((j) => j.department))].sort(), [jobs]);

  const filteredJobs = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (filters.department && j.department !== filters.department) return false;
      if (filters.stage && j.stage !== filters.stage) return false;
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.hiringManager.toLowerCase().includes(q)
      );
    });
  }, [jobs, filters]);

  const filteredApplicants = useMemo(() => {
    const q = applicantQuery.trim().toLowerCase();
    return candidates.filter((c) => {
      if (applicantStage && c.stageId !== applicantStage) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [candidates, applicantQuery, applicantStage]);

  const selectedJob = selectedJobId ? jobs.find((j) => j.id === selectedJobId) ?? null : null;

  const drawerCandidates = useMemo(() => {
    if (!selectedJobId) return [];
    return candidates.filter((c) => getCandidatesForJob(selectedJobId).some((x) => x.id === c.id));
  }, [selectedJobId, candidates]);

  const openPostJob = () => {
    setJobFormMode("create");
    setEditingJob(null);
    setJobFormOpen(true);
  };

  const openEditJob = (job: HrmRecruitmentJob) => {
    setJobFormMode("edit");
    setEditingJob(job);
    setJobFormOpen(true);
  };

  const handleJobSubmit = (values: RecruitmentJobFormValues) => {
    if (jobFormMode === "edit" && editingJob) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === editingJob.id
            ? {
                ...j,
                ...values,
                salaryRange: values.salaryRange || undefined,
                postedAt:
                  values.stage === "published" && j.postedAt === "—"
                    ? new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                    : j.postedAt,
              }
            : j,
        ),
      );
      setSuccessMessage(`Updated ${values.title}`);
    } else {
      const id = `j-${Date.now()}`;
      const newJob: HrmRecruitmentJob = {
        id,
        ...values,
        applicants: 0,
        interviewed: 0,
        offers: 0,
        avgDaysOpen: 0,
        salaryRange: values.salaryRange || undefined,
        postedAt:
          values.stage === "published"
            ? new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
            : "—",
      };
      setJobs((prev) => [newJob, ...prev]);
      setSuccessMessage(values.stage === "published" ? `Published ${values.title}` : `Saved ${values.title} as draft`);
    }
    window.setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleScheduleSubmit = (values: ScheduleInterviewFormValues) => {
    if (!scheduleCandidate) return;

    const day = dateIsoToDay(values.date);
    const meetUrl = values.meetingUrl.startsWith("http") ? values.meetingUrl : `https://${values.meetingUrl}`;

    const event: HrmScheduleEvent = {
      id: `int-${Date.now()}`,
      date: day,
      time: formatTimeLabel(values.time),
      name: scheduleCandidate.name,
      role: `${scheduleCandidate.role} · ${values.interviewType}`,
      bio: values.notes.trim() || scheduleCandidate.email,
      kind: "interview",
      meetingUrl: meetUrl,
    };

    setInterviews((prev) => [...prev, event].sort((a, b) => a.date - b.date || a.time.localeCompare(b.time)));
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === scheduleCandidate.id && c.stageId === "applicant" ? { ...c, stageId: "interviewed" } : c,
      ),
    );
    setTab("interviews");
    setSuccessMessage(`Interview scheduled for ${scheduleCandidate.name}`);
    window.setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDrawerCandidatesChange = (next: HrmCandidate[]) => {
    const drawerIds = new Set(drawerCandidates.map((c) => c.id));
    setCandidates((prev) => [...prev.filter((c) => !drawerIds.has(c.id)), ...next]);
  };

  return (
    <div className="pb-8">
      {successMessage ? (
        <div className="mx-3 mb-3 mt-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 md:mx-4">
          {successMessage}
        </div>
      ) : null}

      <CrmShell>
        <HrmCompactBanner
          title="Recruitment"
          subtitle="Open roles · applicant pipeline · interviews & offers"
          stats={[
            { label: "Open roles", value: stats.openRoles },
            { label: "Applicants", value: stats.applicants },
            { label: "Interviews", value: stats.interviews, tone: "warning" },
            { label: "Hired", value: stats.hired, tone: "success" },
          ]}
          actions={
            <button
              type="button"
              onClick={openPostJob}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/25"
            >
              <Plus className="h-3.5 w-3.5" />
              Post job
            </button>
          }
        />

        <HrmPanelTabs
          tabs={[
            { id: "roles" as const, label: "Open roles", count: filteredJobs.length },
            { id: "pipeline" as const, label: "Pipeline", count: candidates.length },
            { id: "applicants" as const, label: "All applicants", count: filteredApplicants.length },
            { id: "interviews" as const, label: "Interviews", count: interviews.length },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="p-3 md:p-4">
          {tab === "roles" ? (
            <div className="space-y-4">
              <OrgChartStatStrip
                stats={[
                  {
                    label: "Published roles",
                    value: stats.publishedCount,
                    hint: `${stats.openRoles} openings`,
                    icon: Briefcase,
                    tone: "blue",
                  },
                  {
                    label: "Active applicants",
                    value: stats.applicants,
                    hint: "Across all roles",
                    icon: Target,
                    tone: "emerald",
                  },
                  {
                    label: "Interviews this week",
                    value: stats.interviews,
                    hint: "Scheduled",
                    icon: CalendarClock,
                    tone: "amber",
                  },
                ]}
              />

              <RecruitmentToolbar
                filters={filters}
                onChange={setFilters}
                departments={departments}
                resultCount={filteredJobs.length}
                onPostJob={openPostJob}
              />

              {filteredJobs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
                  <Briefcase className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">No roles match your filters</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredJobs.map((job) => (
                    <RecruitmentJobCard
                      key={job.id}
                      job={job}
                      selected={selectedJobId === job.id}
                      onSelect={() => setSelectedJobId(job.id)}
                      onEdit={() => openEditJob(job)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === "pipeline" ? (
            <CrmPanel>
              <CrmPanelHead
                title="Hiring pipeline"
                subtitle="Drag candidates between Applicant, Interviewed, and Hired stages"
                accent
                actions={
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#191970]/5 px-2.5 py-1 text-[11px] font-semibold text-[#191970]">
                    <Kanban className="h-3.5 w-3.5" />
                    {candidates.length} candidates
                  </span>
                }
              />
              <div className="p-4">
                <HrmDashboardRecruitmentBoard
                  candidates={candidates}
                  onChange={setCandidates}
                  onClose={() => setTab("roles")}
                  embedded
                />
              </div>
            </CrmPanel>
          ) : null}

          {tab === "applicants" ? (
            <CrmPanel>
              <CrmPanelHead
                title="All applicants"
                subtitle="Search and filter across every open role"
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="search"
                      value={applicantQuery}
                      onChange={(e) => setApplicantQuery(e.target.value)}
                      placeholder="Search candidates…"
                      className="h-8 rounded-lg border border-slate-200/80 px-3 text-xs outline-none focus:border-[#2277ff]/50 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <select
                      value={applicantStage}
                      onChange={(e) => setApplicantStage(e.target.value)}
                      className="h-8 rounded-lg border border-slate-200/80 px-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="">All stages</option>
                      <option value="applicant">Applicant</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                }
              />
              <div className="p-4">
                <RecruitmentApplicantsTable
                  candidates={filteredApplicants}
                  onSchedule={(c) => {
                    setScheduleCandidate(c);
                    setScheduleOpen(true);
                  }}
                />
              </div>
            </CrmPanel>
          ) : null}

          {tab === "interviews" ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <CrmPanel>
                <CrmPanelHead
                  title="Upcoming interviews"
                  subtitle="Panel rounds, culture fits, and screening calls"
                />
                <div className="p-4">
                  <RecruitmentInterviewsPanel
                    events={interviews}
                    onJoinMeeting={(event) => {
                      setActiveMeeting(event);
                      setMeetingOpen(true);
                    }}
                  />
                </div>
              </CrmPanel>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">This week</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-[#191970]">{stats.interviews}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Interviews scheduled</p>
                </div>
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{stats.hired} hired</p>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80">
                    Candidates moved to Hired this cycle
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </CrmShell>

      <RecruitmentJobDrawer
        job={selectedJob}
        candidates={drawerCandidates}
        onCandidatesChange={handleDrawerCandidatesChange}
        onClose={() => setSelectedJobId(null)}
      />

      <RecruitmentJobFormModal
        open={jobFormOpen}
        mode={jobFormMode}
        initial={editingJob}
        departments={departments}
        onClose={() => setJobFormOpen(false)}
        onSubmit={handleJobSubmit}
      />

      <RecruitmentScheduleInterviewModal
        open={scheduleOpen}
        candidate={scheduleCandidate}
        onClose={() => setScheduleOpen(false)}
        onSubmit={handleScheduleSubmit}
      />

      <RecruitmentMeetingLinkModal
        open={meetingOpen}
        name={activeMeeting?.name ?? ""}
        role={activeMeeting?.role ?? ""}
        bio={activeMeeting?.bio}
        scheduledLabel={
          activeMeeting
            ? `Scheduled ${String(activeMeeting.date).padStart(2, "0")} Jun 2026 at ${activeMeeting.time}`
            : ""
        }
        meetingUrl={activeMeeting?.meetingUrl ?? ""}
        onClose={() => setMeetingOpen(false)}
      />
    </div>
  );
}
