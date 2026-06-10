import { isAxiosError } from "axios";

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
};

/** Unwrap `{ data: T }` envelopes or return the payload as-is. */
export function unwrapApiData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in (payload as ApiEnvelope<T>)) {
    const inner = (payload as ApiEnvelope<T>).data;
    if (inner !== undefined && inner !== null) return inner as T;
  }
  return payload as T;
}

/** Throw when the backend explicitly reports `success: false`. */
export function assertApiSuccess(body: ApiEnvelope<unknown> | null | undefined): void {
  if (body && typeof body === "object" && body.success === false) {
    throw new Error(body.message ?? body.error ?? "Request failed.");
  }
}

function extractApiMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const body = data as Record<string, unknown>;
  const direct = body.message ?? body.error;
  if (typeof direct === "string" && direct.trim()) return direct;

  const errors = body.errors;
  if (Array.isArray(errors)) {
    const parts = errors
      .map((e) => (typeof e === "string" ? e : null))
      .filter((e): e is string => Boolean(e));
    if (parts.length > 0) return parts.join(". ");
  }

  if (errors && typeof errors === "object") {
    const parts = Object.entries(errors as Record<string, unknown>)
      .map(([key, val]) => {
        if (typeof val === "string") return `${key}: ${val}`;
        if (Array.isArray(val)) return `${key}: ${val.map(String).join(", ")}`;
        return null;
      })
      .filter((v): v is string => Boolean(v));
    if (parts.length > 0) return parts.join(". ");
  }

  return fallback;
}

/** Normalize axios and application errors into a user-facing Error. */
export function toApiError(err: unknown, fallback: string): Error {
  if (err instanceof Error && !isAxiosError(err)) return err;

  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401) return new Error("Your session expired. Please sign in again.");
    if (status === 403) return new Error("You do not have permission to perform this action.");
    if (status === 404) return new Error("The requested resource was not found.");
    if (status === 422) {
      return new Error(extractApiMessage(err.response?.data, "Validation failed. Check your input."));
    }
    return new Error(extractApiMessage(err.response?.data, fallback));
  }

  return new Error(fallback);
}

export function requireCompanyId(companyId: string): string {
  const id = companyId?.trim();
  if (!id) throw new Error("Company context is missing. Sign in again or finish onboarding.");
  return id;
}

export function requireResourceId(id: string, label: string): string {
  const value = id?.trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}
