import type {
  AdminAiModel,
  AdminCompany,
  AdminDashboardStats,
  AdminUser,
  AdminWorkflow,
  Paginated,
  UsersQuery,
} from "@/types/admin";

export const DUMMY_DASHBOARD: AdminDashboardStats = {
  totalUsers: 1284,
  activeUsers: 1196,
  suspendedUsers: 42,
  totalCompanies: 86,
  activeCompanies: 79,
  totalWorkflows: 412,
  aiModelsEnabled: 5,
  aiModelsTotal: 7,
  signups7d: 34,
  apiCalls24h: 284_500,
};

const DUMMY_USERS: AdminUser[] = [
  {
    id: "u_1",
    email: "amelia@atlasbank.com",
    fullName: "Amelia Mensah",
    role: "ADMIN",
    status: "ACTIVE",
    companyId: "co_1",
    companyName: "Atlas Bank",
    createdAt: "2025-11-02T10:00:00Z",
    lastLoginAt: "2026-05-19T08:12:00Z",
  },
  {
    id: "u_2",
    email: "david@helioslogistics.io",
    fullName: "David Kobayashi",
    role: "USER",
    status: "ACTIVE",
    companyId: "co_2",
    companyName: "Helios Logistics",
    createdAt: "2025-12-14T14:22:00Z",
    lastLoginAt: "2026-05-18T19:40:00Z",
  },
  {
    id: "u_3",
    email: "sarah.chen@novafin.com",
    fullName: "Sarah Chen",
    role: "ADMIN",
    status: "SUSPENDED",
    companyId: "co_3",
    companyName: "NovaFin Capital",
    createdAt: "2026-01-08T09:15:00Z",
    lastLoginAt: "2026-04-02T11:05:00Z",
  },
  {
    id: "u_4",
    email: "ops@rivexaflow.com",
    fullName: "Platform Operator",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    createdAt: "2025-06-01T00:00:00Z",
    lastLoginAt: "2026-05-19T06:00:00Z",
  },
  {
    id: "u_5",
    email: "james@meridianhealth.org",
    fullName: "James Okonkwo",
    role: "USER",
    status: "PENDING",
    companyId: "co_4",
    companyName: "Meridian Health",
    createdAt: "2026-05-17T16:30:00Z",
  },
];

export const DUMMY_COMPANIES: AdminCompany[] = [
  {
    id: "co_1",
    name: "Atlas Bank",
    slug: "atlas-bank",
    plan: "Enterprise",
    region: "EU-West",
    memberCount: 142,
    status: "ACTIVE",
    createdAt: "2024-08-12T00:00:00Z",
  },
  {
    id: "co_2",
    name: "Helios Logistics",
    slug: "helios-logistics",
    plan: "Growth",
    region: "US-East",
    memberCount: 58,
    status: "ACTIVE",
    createdAt: "2025-01-20T00:00:00Z",
  },
  {
    id: "co_3",
    name: "NovaFin Capital",
    slug: "novafin",
    plan: "Enterprise",
    region: "UK",
    memberCount: 210,
    status: "SUSPENDED",
    createdAt: "2024-03-05T00:00:00Z",
  },
  {
    id: "co_4",
    name: "Meridian Health",
    slug: "meridian-health",
    plan: "Trial",
    region: "APAC",
    memberCount: 12,
    status: "TRIAL",
    createdAt: "2026-05-01T00:00:00Z",
  },
];

export const DUMMY_AI_MODELS: AdminAiModel[] = [
  {
    id: "m_1",
    name: "GPT-4o Enterprise",
    provider: "OpenAI",
    modelId: "gpt-4o",
    apiKeyMasked: "sk-••••••••4f2a",
    enabled: true,
    usageCount: 48_200,
    updatedAt: "2026-05-18T12:00:00Z",
  },
  {
    id: "m_2",
    name: "Claude Sonnet",
    provider: "Anthropic",
    modelId: "claude-sonnet-4",
    apiKeyMasked: "sk-ant-••••••9c1",
    enabled: true,
    usageCount: 31_400,
    updatedAt: "2026-05-17T09:30:00Z",
  },
  {
    id: "m_3",
    name: "Gemini Pro",
    provider: "Google",
    modelId: "gemini-1.5-pro",
    apiKeyMasked: "AI••••••••7b3",
    enabled: false,
    usageCount: 0,
    updatedAt: "2026-05-10T15:00:00Z",
  },
];

export const DUMMY_WORKFLOWS: AdminWorkflow[] = [
  {
    id: "wf_1",
    name: "KYC intake automation",
    companyName: "Atlas Bank",
    companyId: "co_1",
    status: "ACTIVE",
    runs24h: 1240,
    updatedAt: "2026-05-19T07:00:00Z",
  },
  {
    id: "wf_2",
    name: "Invoice approval chain",
    companyName: "Helios Logistics",
    companyId: "co_2",
    status: "ACTIVE",
    runs24h: 380,
    updatedAt: "2026-05-18T22:15:00Z",
  },
  {
    id: "wf_3",
    name: "Compliance document review",
    companyName: "NovaFin Capital",
    companyId: "co_3",
    status: "PAUSED",
    runs24h: 0,
    updatedAt: "2026-04-28T10:00:00Z",
  },
];

function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function filterDummyUsers(query: UsersQuery): Paginated<AdminUser> {
  let list = [...DUMMY_USERS];
  const search = query.search?.trim().toLowerCase();
  if (search) {
    list = list.filter(
      (u) =>
        u.email.toLowerCase().includes(search) ||
        u.fullName.toLowerCase().includes(search) ||
        u.companyName?.toLowerCase().includes(search),
    );
  }
  if (query.status) list = list.filter((u) => u.status === query.status);
  if (query.role) list = list.filter((u) => u.role === query.role);
  return paginate(list, query.page ?? 1, query.pageSize ?? 10);
}
