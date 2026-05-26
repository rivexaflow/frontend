import type {
  AdminAiModel,
  AdminCompany,
  AdminDashboardStats,
  AdminUser,
  AdminWorkflow,
  Paginated,
} from "@/types/admin";
import type { Role } from "@/types/auth";

/** Coerce API values to a finite number (handles snake_case payloads and nulls). */
export function toNum(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function formatCount(value: unknown): string {
  return toNum(value).toLocaleString();
}

function pick<T>(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

export function normalizeDashboardStats(raw: unknown): AdminDashboardStats | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const totalUsers = toNum(pick(r, "totalUsers", "total_users"));
  const activeUsers = toNum(pick(r, "activeUsers", "active_users"));
  const suspendedUsers = toNum(pick(r, "suspendedUsers", "suspended_users"));
  const totalCompanies = toNum(pick(r, "totalCompanies", "total_companies"));
  const activeCompanies = toNum(pick(r, "activeCompanies", "active_companies"));
  const totalWorkflows = toNum(pick(r, "totalWorkflows", "total_workflows"));
  const aiModelsEnabled = toNum(pick(r, "aiModelsEnabled", "ai_models_enabled"));
  const aiModelsTotal = toNum(pick(r, "aiModelsTotal", "ai_models_total"));
  const signups7d = toNum(pick(r, "signups7d", "signups_7d", "signups7D"));
  const apiCalls24h = toNum(pick(r, "apiCalls24h", "api_calls_24h"));

  const hasAnyMetric =
    totalUsers > 0 ||
    activeUsers > 0 ||
    totalCompanies > 0 ||
    totalWorkflows > 0 ||
    aiModelsTotal > 0 ||
    signups7d > 0 ||
    apiCalls24h > 0 ||
    pick(r, "totalUsers", "total_users", "activeUsers", "active_users") !== undefined;

  if (!hasAnyMetric) return null;

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalCompanies,
    activeCompanies,
    totalWorkflows,
    aiModelsEnabled,
    aiModelsTotal,
    signups7d,
    apiCalls24h,
  };
}

export function normalizeAiModel(raw: unknown): AdminAiModel | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;
  return {
    id,
    name: String(pick(r, "name") ?? "Unnamed"),
    provider: String(pick(r, "provider") ?? "—"),
    modelId: String(pick(r, "modelId", "model_id") ?? "—"),
    apiKeyMasked: String(pick(r, "apiKeyMasked", "api_key_masked", "apiKey") ?? "••••••••"),
    enabled: Boolean(pick(r, "enabled", "isEnabled", "is_enabled") ?? true),
    usageCount: toNum(pick(r, "usageCount", "usage_count")),
    updatedAt: String(pick(r, "updatedAt", "updated_at") ?? new Date().toISOString()),
  };
}

export function normalizeWorkflow(raw: unknown): AdminWorkflow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;
  return {
    id,
    name: String(pick(r, "name") ?? "Workflow"),
    companyName: String(pick(r, "companyName", "company_name") ?? "—"),
    companyId: String(pick(r, "companyId", "company_id") ?? ""),
    status: (pick(r, "status") as AdminWorkflow["status"]) ?? "DRAFT",
    runs24h: toNum(pick(r, "runs24h", "runs_24h")),
    updatedAt: String(pick(r, "updatedAt", "updated_at") ?? new Date().toISOString()),
  };
}

export function normalizePaginatedUsers(raw: unknown): Paginated<AdminUser> | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const itemsRaw = pick(r, "items", "users", "data");
  if (!Array.isArray(itemsRaw)) return null;

  const items: AdminUser[] = [];
  for (const row of itemsRaw) {
    if (!row || typeof row !== "object") continue;
    const u = row as Record<string, unknown>;
    const id = pick(u, "id", "_id");
    if (typeof id !== "string") continue;
    items.push({
      id,
      email: String(pick(u, "email") ?? ""),
      fullName: String(pick(u, "fullName", "full_name", "name") ?? ""),
      role: (pick(u, "role") as Role) ?? "USER",
      status: (pick(u, "status") as AdminUser["status"]) ?? "ACTIVE",
      companyId: pick(u, "companyId", "company_id") as string | undefined,
      companyName: pick(u, "companyName", "company_name") as string | undefined,
      createdAt: String(pick(u, "createdAt", "created_at") ?? ""),
      lastLoginAt: pick(u, "lastLoginAt", "last_login_at") as string | undefined,
    });
  }

  const total = toNum(pick(r, "total"), items.length);
  const page = toNum(pick(r, "page"), 1);
  const pageSize = toNum(pick(r, "pageSize", "page_size"), 10);
  const totalPages = toNum(pick(r, "totalPages", "total_pages"), Math.max(1, Math.ceil(total / pageSize)));

  return { items, total, page, pageSize, totalPages };
}

export function normalizeCompany(raw: unknown): AdminCompany | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;
  return {
    id,
    name: String(pick(r, "name") ?? ""),
    slug: String(pick(r, "slug") ?? ""),
    plan: String(pick(r, "plan") ?? "—"),
    region: String(pick(r, "region") ?? "—"),
    memberCount: toNum(pick(r, "memberCount", "member_count")),
    status: (pick(r, "status") as AdminCompany["status"]) ?? "ACTIVE",
    createdAt: String(pick(r, "createdAt", "created_at") ?? ""),
  };
}
