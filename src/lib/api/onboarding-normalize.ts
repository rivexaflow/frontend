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

function normalizeUser(raw: unknown): OnboardingUser | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  const email = pick(r, "email");
  if (typeof id !== "string" || typeof email !== "string") return null;

  return {
    id,
    email,
    fullName: String(pick(r, "fullName", "full_name", "name") ?? ""),
    role: String(pick(r, "role", "profileRole", "profile_role") ?? "owner"),
    onboardingStep: coerceStep(
      pick(r, "onboardingStep", "onboarding_step"),
      "BASIC_INFO",
    ),
  };
}

function normalizeCompany(raw: unknown): OnboardingCompany | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return undefined;

  const modulesRaw = pick(r, "modules");
  const modules = Array.isArray(modulesRaw)
    ? modulesRaw.filter((m): m is string => typeof m === "string")
    : [];

  return {
    id,
    name: String(pick(r, "name", "businessName", "business_name") ?? ""),
    industry: String(pick(r, "industry") ?? "other") as OnboardingIndustry,
    teamSize: Number(pick(r, "teamSize", "team_size") ?? 0),
    modules,
  };
}

export function normalizeOnboardingState(raw: unknown): OnboardingState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const user = normalizeUser(pick(r, "user"));
  if (!user) return null;

  const step = coerceStep(pick(r, "step", "currentStep"), user.onboardingStep);
  const nextStep = coerceStep(pick(r, "nextStep", "next_step"), step);

  const rec = pick(r, "recommendedModules", "recommended_modules");
  const avail = pick(r, "availableModules", "available_modules");

  return {
    step,
    nextStep,
    user: { ...user, onboardingStep: step },
    company: normalizeCompany(pick(r, "company")),
    recommendedModules: Array.isArray(rec)
      ? rec.filter((m): m is string => typeof m === "string")
      : [],
    availableModules: Array.isArray(avail)
      ? avail.filter((m): m is string => typeof m === "string")
      : [],
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
