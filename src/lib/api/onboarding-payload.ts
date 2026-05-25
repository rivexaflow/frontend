import type { BasicInfoForm, BusinessInfoForm } from "@/features/onboarding/schemas/onboarding.schema";
import type { ProfileRole } from "@/types/onboarding";

/** Matches api-docs `UserRole` schema: owner | manager | freelancer (no "other"). */
const PROFILE_ROLES: readonly ProfileRole[] = ["owner", "manager", "freelancer"];

/** Profile role from API state — never use JWT role (USER / ADMIN / SUPER_ADMIN). */
export function coerceProfileRole(...candidates: (string | undefined)[]): ProfileRole | "" {
  for (const value of candidates) {
    if (value && PROFILE_ROLES.includes(value as ProfileRole)) {
      return value as ProfileRole;
    }
  }
  return "";
}

/**
 * Request body for POST /api/onboarding/basic-info.
 * Api-docs list fullName + role; live API also requires userId (undocumented).
 */
export function toBasicInfoBody(
  userId: string,
  values: BasicInfoForm,
): { userId: string; fullName: string; role: ProfileRole } {
  return {
    userId,
    fullName: values.fullName.trim(),
    role: values.role,
  };
}

/**
 * Request body for POST /api/onboarding/business-info.
 * Live API requires userId (undocumented in api-docs).
 */
export function toBusinessInfoBody(
  userId: string,
  values: BusinessInfoForm,
): Record<string, string | number> {
  const businessName = values.businessName.trim();
  const body: Record<string, string | number> = {
    userId,
    businessName,
    business_name: businessName,
    industry: values.industry,
    teamSize: values.teamSize,
    team_size: values.teamSize,
  };
  if (values.monthlyLeads !== undefined) {
    body.monthlyLeads = values.monthlyLeads;
    body.monthly_leads = values.monthlyLeads;
  }
  return body;
}

/**
 * Request body for POST /api/onboarding/select-modules.
 */
export function toSelectModulesBody(userId: string, selectedModules: string[]) {
  return {
    userId,
    user_id: userId,
    selectedModules,
    selected_modules: selectedModules,
  };
}

/**
 * Request body for POST /api/onboarding/recommendations.
 */
export function toRecommendationsBody(userId: string, industry: string, teamSize: number) {
  return {
    userId,
    industry,
    teamSize,
    team_size: teamSize,
  };
}
