"use client";

import { resolveCompanyId } from "@/lib/workspace/company-context";

/** HRM routes use `{companyId}` — mapped to the active workspace / company id. */
export function getHrCompanyId(): string | null {
  return resolveCompanyId();
}
