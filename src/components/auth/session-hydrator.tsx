"use client";

import { useEffect } from "react";

import { getProfile } from "@/lib/api/auth";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";

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
export function SessionHydrator() {
  useEffect(() => {
    const state = authStore.getState();
    if (!state.token) return;

    let cancelled = false;

    (async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;

        const current = authStore.getState().user;
        const merged = {
          id: profile.id || current?.id || "unknown",
          name: profile.name || current?.name || "User",
          email: profile.email || current?.email || "",
          role: profile.role || current?.role || "USER",
          workspaceId: profile.workspaceId ?? current?.workspaceId,
          workspaceSlug: profile.workspaceSlug ?? current?.workspaceSlug,
        };

        authStore.setState({ user: merged, role: merged.role });

        if (profile.workspaceId || profile.workspaceSlug) {
          workspaceStore.getState().setWorkspace({
            workspaceId: profile.workspaceId ?? "",
            workspaceName:
              profile.workspaceName ?? profile.workspaceSlug ?? "Workspace",
            workspaceSlug: profile.workspaceSlug ?? "",
            plan: profile.plan,
          });
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
