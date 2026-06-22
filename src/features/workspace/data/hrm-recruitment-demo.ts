import {
  DEMO_HRM_CANDIDATES,
  HRM_OPEN_POSITIONS,
  HRM_SCHEDULE_EVENTS,
  type HrmCandidate,
  type HrmRecruitmentStage,
  type HrmScheduleEvent,
} from "@/features/workspace/data/hrm-dashboard-demo";

export type HrmJobStage = "draft" | "published" | "closed";
export type HrmJobPriority = "high" | "medium" | "low";

export type HrmRecruitmentJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  openings: number;
  applicants: number;
  interviewed: number;
  offers: number;
  stage: HrmJobStage;
  postedAt: string;
  hiringManager: string;
  priority: HrmJobPriority;
  avgDaysOpen: number;
  description: string;
  salaryRange?: string;
};

const POSITION_TO_JOB: Record<string, Partial<HrmRecruitmentJob>> = {
  "sales-rep": {
    id: "j2",
    title: "Sales Executive",
    department: "Sales",
    hiringManager: "Rahul Verma",
    stage: "published",
    postedAt: "May 28, 2026",
    priority: "high",
  },
  "account-executive": {
    id: "j-ae",
    title: "Account Executive",
    department: "Sales",
    hiringManager: "Rahul Verma",
    stage: "published",
    postedAt: "May 20, 2026",
    priority: "high",
  },
  engineering: {
    id: "j1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    hiringManager: "Nico Laurent",
    stage: "published",
    postedAt: "Jun 1, 2026",
    priority: "medium",
  },
  "customer-success": {
    id: "j-cs",
    title: "Customer Success Manager",
    department: "Customer",
    hiringManager: "Anita Desai",
    stage: "published",
    postedAt: "Jun 3, 2026",
    priority: "medium",
  },
  sdr: {
    id: "j-sdr",
    title: "SDR / BDR",
    department: "Sales",
    hiringManager: "Rahul Verma",
    stage: "published",
    postedAt: "May 15, 2026",
    priority: "high",
  },
  support: {
    id: "j-support",
    title: "Support Specialist",
    department: "Operations",
    hiringManager: "Priya Mehta",
    stage: "published",
    postedAt: "May 22, 2026",
    priority: "low",
  },
};

function countByPosition(positionId: string, stage?: HrmRecruitmentStage) {
  return DEMO_HRM_CANDIDATES.filter(
    (c) => c.positionId === positionId && (stage ? c.stageId === stage : true),
  ).length;
}

function countOffers(positionId: string) {
  return DEMO_HRM_CANDIDATES.filter((c) => c.positionId === positionId && c.stageId === "hired").length;
}

export const DEMO_HRM_RECRUITMENT_JOBS: HrmRecruitmentJob[] = [
  ...HRM_OPEN_POSITIONS.map((pos) => {
    const override = POSITION_TO_JOB[pos.id] ?? {};
    const applicants = countByPosition(pos.id);
    const interviewed = countByPosition(pos.id, "interviewed") + countByPosition(pos.id, "hired");
    const offers = countOffers(pos.id);
    return {
      id: override.id ?? pos.id,
      title: override.title ?? pos.label,
      department: pos.department,
      location: pos.department === "Engineering" ? "Remote · India" : "Mumbai HQ",
      employmentType: "Full-time" as const,
      openings: pos.openings,
      applicants,
      interviewed,
      offers,
      stage: override.stage ?? "published",
      postedAt: override.postedAt ?? "Jun 2026",
      hiringManager: override.hiringManager ?? "HR Team",
      priority: override.priority ?? "medium",
      avgDaysOpen: pos.avgDaysOpen,
      description: pos.description,
      salaryRange:
        pos.department === "Engineering"
          ? "₹18–28 LPA"
          : pos.department === "Sales"
            ? "₹8–14 LPA + commission"
            : "₹6–12 LPA",
    };
  }),
  {
    id: "j3",
    title: "HR Business Partner",
    department: "HR",
    location: "Mumbai HQ",
    employmentType: "Full-time",
    openings: 1,
    applicants: 9,
    interviewed: 3,
    offers: 0,
    stage: "draft",
    postedAt: "—",
    hiringManager: "Anita Desai",
    priority: "medium",
    avgDaysOpen: 0,
    description: "Partner with business units on workforce planning, policy, and employee relations.",
    salaryRange: "₹14–20 LPA",
  },
];

export function getRecruitmentStats(
  jobs: HrmRecruitmentJob[] = DEMO_HRM_RECRUITMENT_JOBS,
  interviews: HrmScheduleEvent[] = DEMO_HRM_INTERVIEWS,
  candidates: HrmCandidate[] = DEMO_HRM_CANDIDATES,
) {
  const published = jobs.filter((j) => j.stage === "published");
  const openRoles = published.reduce((s, j) => s + j.openings, 0);
  const applicants = candidates.length;
  const interviewEvents = interviews.filter((e) => e.kind === "interview");
  const interviewsCount = interviewEvents.length;
  const hired = candidates.filter((c) => c.stageId === "hired").length;

  return { openRoles, publishedCount: published.length, applicants, interviews: interviewsCount, hired };
}

export function getCandidatesForJob(jobId: string): HrmCandidate[] {
  const job = DEMO_HRM_RECRUITMENT_JOBS.find((j) => j.id === jobId);
  if (!job) return [];

  const positionId =
    Object.entries(POSITION_TO_JOB).find(([, v]) => v.id === jobId)?.[0] ??
    HRM_OPEN_POSITIONS.find((p) => p.label === job.title)?.id;

  if (!positionId) return [];
  return DEMO_HRM_CANDIDATES.filter((c) => c.positionId === positionId);
}

export const DEMO_HRM_INTERVIEWS = HRM_SCHEDULE_EVENTS.filter((e) => e.kind === "interview").sort(
  (a, b) => a.date - b.date || a.time.localeCompare(b.time),
);

export { DEMO_HRM_CANDIDATES, HRM_RECRUITMENT_STAGES } from "@/features/workspace/data/hrm-dashboard-demo";
export type { HrmCandidate, HrmRecruitmentStage } from "@/features/workspace/data/hrm-dashboard-demo";
