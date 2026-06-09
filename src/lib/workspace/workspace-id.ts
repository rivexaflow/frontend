/** Extract company/workspace id from API payloads (snake_case or camelCase). */
export function pickWorkspaceId(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const candidate = r.workspaceId ?? r.workspace_id ?? r.companyId ?? r.company_id;
  if (typeof candidate !== "string") return undefined;
  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseJwtPayload(token: string | undefined | null): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function workspaceIdFromToken(token: string | undefined | null): string | undefined {
  return pickWorkspaceId(parseJwtPayload(token));
}
