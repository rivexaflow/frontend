"use client";

import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import type { CurrentUser } from "@/types/auth";
import type { OnboardingCompany } from "@/types/onboarding";
import { workspaceIdFromToken } from "@/lib/workspace/workspace-id";

/** User-facing copy when HRM/company APIs cannot resolve a tenant id. */
export const MISSING_COMPANY_CONTEXT_MESSAGE =
  "Your company workspace is not linked to this session. Sign out and sign in again, or finish onboarding if you have not already.";

export { pickWorkspaceId } from "@/lib/workspace/workspace-id";

export function workspaceIdFromCompany(company: OnboardingCompany | undefined): string | undefined {
  return company?.id?.trim() || undefined;
}

export function slugFromCompany(company: OnboardingCompany | { slug?: string } | undefined): string | undefined {
  if (!company || typeof company !== "object") return undefined;
  const slug = (company as { slug?: string }).slug;
  return typeof slug === "string" && slug.trim() ? slug.trim() : undefined;
}

/** Canonical company id for `/hr/{id}` and `/company/{id}` routes. */
export function resolveCompanyId(): string | null {
  const storeId = workspaceStore.getState().workspaceId?.trim();
  const authId = authStore.getState().user?.workspaceId?.trim();
  const jwtId = workspaceIdFromToken(authStore.getState().token);
  return storeId || authId || jwtId || null;
}

type SyncWorkspaceInput = {
  workspaceId?: string;
  workspaceSlug?: string;
  workspaceName?: string;
  plan?: string;
  modules?: string[];
  token?: string | null;
};

/** Keep auth user + in-memory workspace store aligned with API/JWT company context. */
export function syncWorkspaceContext(input: SyncWorkspaceInput = {}): string | null {
  const user = authStore.getState().user;
  const token = input.token ?? authStore.getState().token;

  const workspaceId =
    input.workspaceId?.trim() ||
    user?.workspaceId?.trim() ||
    workspaceIdFromToken(token) ||
    undefined;

  const workspaceSlug = input.workspaceSlug?.trim() || user?.workspaceSlug?.trim() || undefined;
  const workspaceName =
    input.workspaceName?.trim() || workspaceSlug || workspaceStore.getState().workspaceName || "Workspace";

  if (workspaceId && user?.workspaceId !== workspaceId) {
    authStore.getState().updateUser({ workspaceId });
  }

  if (workspaceId || workspaceSlug) {
    workspaceStore.getState().setWorkspace({
      workspaceId: workspaceId ?? workspaceStore.getState().workspaceId ?? "",
      workspaceName,
      workspaceSlug: workspaceSlug ?? workspaceStore.getState().workspaceSlug ?? "",
      plan: input.plan ?? workspaceStore.getState().plan ?? undefined,
      modules: input.modules ?? workspaceStore.getState().modules ?? undefined,
    });
  }

  return workspaceId ?? null;
}

export function applyCompanyToUser(
  user: CurrentUser,
  company: OnboardingCompany | undefined,
): CurrentUser {
  const workspaceId = workspaceIdFromCompany(company) ?? user.workspaceId;
  const workspaceSlug = slugFromCompany(company) ?? user.workspaceSlug;
  return {
    ...user,
    workspaceId,
    workspaceSlug,
  };
}
