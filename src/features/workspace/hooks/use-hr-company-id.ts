"use client";

import { useEffect, useState } from "react";

import { getHrCompanyId } from "@/lib/hrm/company-id";
import { resolveCompanyId, syncWorkspaceContext } from "@/lib/workspace/company-context";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";

/** Reactive company id for HRM API calls. */
export function useHrCompanyId(): string | null {
  const authWorkspaceId = authStore((s) => s.user?.workspaceId);
  const token = authStore((s) => s.token);
  const storeWorkspaceId = workspaceStore((s) => s.workspaceId);
  const [companyId, setCompanyId] = useState<string | null>(() => getHrCompanyId());

  useEffect(() => {
    syncWorkspaceContext();
    setCompanyId(resolveCompanyId());
  }, [storeWorkspaceId, authWorkspaceId, token]);

  return companyId;
}
