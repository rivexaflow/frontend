import type {
  OnboardingCompany,
  OnboardingIndustry,
  OnboardingState,
  OnboardingStep,
  OnboardingUser,
} from "@/types/onboarding";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

/** Session hints when the API returns step/company without a full nested user. */
export type NormalizeOnboardingContext = {
  fallbackUserId?: string;
  fallbackEmail?: string;
  fallbackFullName?: string;
  fallbackRole?: string;
};

export function unwrapOnboarding<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
}

const STEP_SET = new Set<OnboardingStep>([
  "LOGIN_REGISTER",
  "BASIC_INFO",
  "BUSINESS_INFO",
  "COMPANY_CREATE",
  "MODULE_RECOMMENDATION",
  "MODULE_SELECT",
  "DASHBOARD_LOAD",
  "DONE",
]);

function coerceStep(raw: unknown, fallback: OnboardingStep = "BASIC_INFO"): OnboardingStep {
  if (typeof raw !== "string") return fallback;
  if (STEP_SET.has(raw as OnboardingStep)) return raw as OnboardingStep;
  return fallback;
}

function pick(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function coerceStringId(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  if (raw && typeof raw === "object") {
    const oid = (raw as { $oid?: unknown }).$oid;
    if (typeof oid === "string" && oid.trim()) return oid.trim();
  }
  return null;
}

function stringModules(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((m): m is string => typeof m === "string") : [];
}

function normalizeUser(
  raw: unknown,
  context?: NormalizeOnboardingContext,
  stepFallback: OnboardingStep = "BASIC_INFO",
): OnboardingUser | null {
  if (!raw || typeof raw !== "object") {
    if (context?.fallbackUserId && context.fallbackEmail) {
      return {
        id: context.fallbackUserId,
        email: context.fallbackEmail,
        fullName: context.fallbackFullName ?? "",
        role: context.fallbackRole ?? "owner",
        onboardingStep: stepFallback,
      };
    }
    return null;
  }

  const r = raw as Record<string, unknown>;
  const id =
    coerceStringId(pick(r, "id", "_id", "userId", "user_id")) ?? context?.fallbackUserId ?? null;
  const emailRaw = pick(r, "email", "userEmail", "user_email");
  const email =
    (typeof emailRaw === "string" && emailRaw.trim() ? emailRaw.trim() : undefined) ??
    context?.fallbackEmail;

  if (!id || !email) return null;

  return {
    id,
    email,
    fullName: String(
      pick(r, "fullName", "full_name", "name") ?? context?.fallbackFullName ?? "",
    ),
    role: String(pick(r, "role", "profileRole", "profile_role") ?? context?.fallbackRole ?? "owner"),
    onboardingStep: coerceStep(pick(r, "onboardingStep", "onboarding_step", "step"), stepFallback),
  };
}

function normalizeCompany(
  raw: unknown,
  fallbackModules: string[] = [],
): OnboardingCompany | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const id = coerceStringId(pick(r, "id", "_id", "companyId", "company_id", "workspaceId", "workspace_id"));
  if (!id) return undefined;

  const modules = stringModules(pick(r, "modules", "selectedModules", "selected_modules"));
  return {
    id,
    name: String(pick(r, "name", "businessName", "business_name") ?? ""),
    industry: String(pick(r, "industry") ?? "other") as OnboardingIndustry,
    teamSize: Number(pick(r, "teamSize", "team_size") ?? 0),
    modules: modules.length ? modules : fallbackModules,
  };
}

export function normalizeOnboardingState(
  raw: unknown,
  context?: NormalizeOnboardingContext,
): OnboardingState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const step = coerceStep(
    pick(r, "step", "currentStep", "onboardingStep", "onboarding_step"),
    "BASIC_INFO",
  );
  const nextStep = coerceStep(pick(r, "nextStep", "next_step"), step);
  const rootModules = stringModules(pick(r, "selectedModules", "selected_modules", "modules"));

  let user =
    normalizeUser(pick(r, "user"), context, step) ??
    normalizeUser(r, context, step);
  if (!user && context?.fallbackUserId && context.fallbackEmail) {
    user = normalizeUser(null, context, step);
  }
  if (!user) return null;

  const company =
    normalizeCompany(pick(r, "company", "workspace", "organization"), rootModules) ??
    (rootModules.length && user.id
      ? {
          id: user.id,
          name: "",
          industry: "other" as OnboardingIndustry,
          teamSize: 0,
          modules: rootModules,
        }
      : undefined);

  const rec = pick(r, "recommendedModules", "recommended_modules");
  const avail = pick(r, "availableModules", "available_modules");

  return {
    step,
    nextStep,
    user: { ...user, onboardingStep: step },
    company,
    recommendedModules: stringModules(rec),
    availableModules: stringModules(avail),
  };
}

export function normalizeModulesCatalog(raw: unknown): {
  modules: string[];
  descriptions: Record<string, string>;
} {
  if (!raw || typeof raw !== "object") {
    return { modules: [], descriptions: {} };
  }
  const r = raw as Record<string, unknown>;
  const modulesRaw = pick(r, "modules");
  const descRaw = pick(r, "descriptions");

  return {
    modules: Array.isArray(modulesRaw)
      ? modulesRaw.filter((m): m is string => typeof m === "string")
      : [],
    descriptions:
      descRaw && typeof descRaw === "object"
        ? (descRaw as Record<string, string>)
        : {},
  };
}
