"use client";

import { useEffect } from "react";

import { getProfile } from "@/lib/api/auth";
import { onboardingApi } from "@/lib/api/onboarding";
import { applyOnboardingStateToAuthUser } from "@/lib/api/onboarding-sync";
import { resolveCompanyId, syncWorkspaceContext } from "@/lib/workspace/company-context";
import { authStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api/client";

/**
 * Silent client-side hydrator.
 *
 * Mount once near the top of an authenticated layout (workspace, super-admin)
 * to refresh the locally-persisted user from `GET /api/auth/profile`.
 *
 *  - Runs only when a token is present (anonymous routes never call the API).
 *  - Failures are intentionally silent: the global axios 401 interceptor
 *    already takes care of redirecting expired sessions to /login.
 *  - Pure side-effect; renders nothing.
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  return null;
}

export function SessionHydrator() {
  useEffect(() => {
    let token = authStore.getState().token;
    if (!token) {
      const cookieToken = getCookie("rvx_access_token");
      if (cookieToken) {
        authStore.setState({ token: cookieToken });
        token = cookieToken;
      }
    }
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;

        const current = authStore.getState().user;
        const merged = {
          id: profile.id || current?.id || "unknown",
          name: profile.name || current?.name || "User",
          fullName: current?.fullName,
          email: profile.email || current?.email || "",
          role: profile.role || current?.role || "USER",
          workspaceId: profile.workspaceId ?? current?.workspaceId,
          workspaceSlug: profile.workspaceSlug ?? current?.workspaceSlug,
          profileRole: profile.profileRole ?? current?.profileRole,
          onboardingStep: profile.onboardingStep ?? current?.onboardingStep,
          selectedModules: profile.selectedModules ?? current?.selectedModules,
        };

        authStore.setState({ user: merged, role: merged.role });

        syncWorkspaceContext({
          workspaceId: merged.workspaceId,
          workspaceSlug: merged.workspaceSlug,
          workspaceName: profile.workspaceName ?? profile.workspaceSlug,
          plan: profile.plan,
        });

        if (merged.workspaceId) {
          try {
            const { data } = await apiClient.get(`/company/${merged.workspaceId}`);
            if (!cancelled && data.success && data.data) {
              const c = data.data;
              syncWorkspaceContext({
                workspaceId: c.id,
                workspaceSlug: c.slug,
                workspaceName: c.brandName || c.name,
                plan: c.size,
                modules: c.modules || [],
                logo: c.logo,
                brandName: c.brandName,
                themeConfig: c.themeConfig,
              });
              if (c.themeConfig && typeof c.themeConfig === 'object' && c.themeConfig.primaryColor) {
                document.documentElement.style.setProperty('--primary-color', c.themeConfig.primaryColor as string);
              }
            }
          } catch (companyErr) {
            console.error("Failed to load company details on hydration:", companyErr);
          }
        }

        if (!resolveCompanyId() && merged.id && merged.id !== "unknown") {
          try {
            const onboarding = await onboardingApi.getOnboardingState(merged.id);
            if (!cancelled && onboarding?.company?.id) {
              applyOnboardingStateToAuthUser(onboarding);
            }
          } catch {
            // Non-fatal: profile + JWT may still provide company context.
          }
        }
      } catch {
        // 401s are handled by the global interceptor; other errors are non-fatal here.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
