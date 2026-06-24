import type { Role } from "@/types/auth";

/**
 * Profile role from onboarding (`UserRole` in api-docs).
 * Not JWT role (USER / ADMIN / SUPER_ADMIN) and not Custom Roles module.
 */
export type ProfileRole = "owner" | "manager" | "freelancer";

export type OnboardingIndustry =
  | "real_estate"
  | "saas"
  | "consulting"
  | "healthcare"
  | "finance"
  | "ecommerce"
  | "other";

/** Backend onboarding step identifiers. */
export type OnboardingStep =
  | "LOGIN_REGISTER"
  | "BASIC_INFO"
  | "BUSINESS_INFO"
  | "COMPANY_CREATE"
  | "MODULE_RECOMMENDATION"
  | "MODULE_SELECT"
  | "DASHBOARD_LOAD"
  | "DONE";

export type OnboardingUser = {
  id: string;
  email: string;
  fullName: string;
  role: ProfileRole | string;
  onboardingStep: OnboardingStep;
};

export type OnboardingCompany = {
  id: string;
  name: string;
  industry: OnboardingIndustry | string;
  teamSize: number;
  modules: string[];
  logo?: string;
};

export type OnboardingState = {
  step: OnboardingStep;
  nextStep: OnboardingStep;
  user: OnboardingUser;
  company?: OnboardingCompany;
  recommendedModules: string[];
  availableModules: string[];
};

export type OnboardingModulesCatalog = {
  modules: string[];
  descriptions: Record<string, string>;
};

/** Maps profile role to workspace navigation / dashboard experience. */
export function profileRoleToNavRole(profileRole: ProfileRole | string | undefined): Role {
  if (profileRole === "owner" || profileRole === "manager") return "ADMIN";
  return "USER";
}

export function isOnboardingComplete(step: OnboardingStep | string | undefined): boolean {
  return step === "DONE" || step === "DASHBOARD_LOAD";
}

/** UI step order (excludes LOGIN_REGISTER — merged into BASIC_INFO). */
export const ONBOARDING_UI_STEPS = [
  { id: "BASIC_INFO" as const, title: "Your profile", short: "Profile" },
  { id: "BUSINESS_INFO" as const, title: "Your business", short: "Business" },
  { id: "MODULE_RECOMMENDATION" as const, title: "Recommendations", short: "Insights" },
  { id: "MODULE_SELECT" as const, title: "Your toolkit", short: "Modules" },
];

export function uiStepFromApi(step: OnboardingStep): (typeof ONBOARDING_UI_STEPS)[number]["id"] {
  if (step === "LOGIN_REGISTER" || step === "BASIC_INFO") return "BASIC_INFO";
  if (step === "BUSINESS_INFO" || step === "COMPANY_CREATE") return "BUSINESS_INFO";
  if (step === "MODULE_RECOMMENDATION") return "MODULE_RECOMMENDATION";
  if (step === "MODULE_SELECT" || step === "DASHBOARD_LOAD" || step === "DONE") return "MODULE_SELECT";
  return "BASIC_INFO";
}

export function apiStepAfterUi(uiStep: (typeof ONBOARDING_UI_STEPS)[number]["id"]): OnboardingStep {
  return uiStep;
}
