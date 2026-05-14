"use client";

import { isAxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ChangePasswordPayload } from "@/schemas/change-password.schema";
import type { LoginPayload, RegisterPayload } from "@/schemas/auth.schema";
import type { Role } from "@/types/auth";

/**
 * Backend may return any of: `token` / `accessToken` / `access_token`,
 * and a user object with `name` / `fullName`, `workspaceSlug` / `workspace_slug`.
 * We type the union here and normalize in `loginUser`.
 */
type RawAuthResponse = {
  success: boolean;
  message?: string;
  data: {
    token?: string;
    accessToken?: string;
    access_token?: string;
    user?: {
      id?: string;
      email?: string;
      name?: string;
      fullName?: string;
      full_name?: string;
      role?: string;
      workspaceId?: string;
      workspace_id?: string;
      workspaceSlug?: string;
      workspace_slug?: string;
      workspaceName?: string;
      workspace_name?: string;
      plan?: string;
    };
    onboardingStep?: string;
    redirectTo?: string;
  };
};

/** Normalized response we hand back to the UI. */
export type AuthResult = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    workspaceId?: string;
    workspaceSlug?: string;
    workspaceName?: string;
    plan?: string;
  };
  onboardingStep?: string;
  redirectTo?: string;
};

const ROLE_SET: ReadonlySet<Role> = new Set<Role>(["SUPER_ADMIN", "ADMIN", "USER"]);
const coerceRole = (raw: unknown): Role => {
  if (typeof raw === "string" && ROLE_SET.has(raw as Role)) return raw as Role;
  return "USER";
};

const pickToken = (raw: RawAuthResponse["data"]): string | null =>
  raw.token ?? raw.accessToken ?? raw.access_token ?? null;

const normalizeUser = (raw: RawAuthResponse["data"], fallbackEmail: string): AuthResult["user"] => {
  const u = raw.user ?? {};
  return {
    id: u.id ?? "unknown",
    email: u.email ?? fallbackEmail,
    name: u.fullName ?? u.full_name ?? u.name ?? (u.email ?? fallbackEmail).split("@")[0],
    role: coerceRole(u.role),
    workspaceId: u.workspaceId ?? u.workspace_id ?? undefined,
    workspaceSlug: u.workspaceSlug ?? u.workspace_slug ?? undefined,
    workspaceName: u.workspaceName ?? u.workspace_name ?? undefined,
    plan: u.plan ?? undefined,
  };
};

export type RegisterResponse = RawAuthResponse;

/**
 * Calls `POST /api/auth/register`.
 *
 * Throws an `Error` whose `message` is a user-facing string suitable for
 * rendering directly in the UI (extracted from the server's error payload
 * when possible, otherwise a stable fallback).
 */
export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  try {
    const { data } = await apiClient.post<RegisterResponse>(endpoints.auth.register, payload);
    return data.data ?? {};
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const body = err.response?.data as
        | { message?: string; error?: string; errors?: Array<{ message?: string }> }
        | undefined;
      const serverMessage =
        body?.message ?? body?.error ?? body?.errors?.[0]?.message ?? undefined;

      if (status === 409) {
        throw new Error(serverMessage ?? "An account with this email already exists.");
      }
      if (status === 400 || status === 422) {
        throw new Error(serverMessage ?? "Please check the information you entered.");
      }
      if (status && status >= 500) {
        throw new Error("Our service is temporarily unavailable. Please try again shortly.");
      }
      throw new Error(serverMessage ?? "We couldn't create your account. Please try again.");
    }
    throw new Error("Network error — please check your connection and try again.");
  }
}

/**
 * Calls `GET /api/auth/profile`.
 *
 * Returns the normalized current user. Used to rehydrate / refresh client state
 * after the initial login (so name/role/workspace changes flow through without
 * forcing the user to sign out and back in).
 */
export async function getProfile(): Promise<AuthResult["user"]> {
  try {
    const { data } = await apiClient.get<RawAuthResponse>(endpoints.auth.profile);
    const raw = data.data ?? {};
    return normalizeUser(raw, raw.user?.email ?? "");
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const body = err.response?.data as { message?: string; error?: string } | undefined;
      const serverMessage = body?.message ?? body?.error;
      if (status === 401 || status === 403) {
        throw new Error(serverMessage ?? "Your session has expired. Please sign in again.");
      }
      if (status && status >= 500) {
        throw new Error("Our service is temporarily unavailable. Please try again shortly.");
      }
      throw new Error(serverMessage ?? "We couldn't load your profile. Please try again.");
    }
    throw new Error("Network error — please check your connection and try again.");
  }
}

/**
 * Calls `POST /api/auth/logout` for server-side session invalidation.
 *
 * This is intentionally *best-effort*: a network failure or 5xx must never
 * trap the user in a half-signed-out limbo, so callers should clear local
 * state regardless of whether this resolves or rejects.
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post(endpoints.auth.logout);
  } catch {
    // Intentional swallow — see JSDoc.
  }
}

/**
 * Calls `POST /api/auth/change-password`.
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  try {
    await apiClient.post(endpoints.auth.changePassword, payload);
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const body = err.response?.data as
        | { message?: string; error?: string; errors?: Array<{ message?: string }> }
        | undefined;
      const serverMessage =
        body?.message ?? body?.error ?? body?.errors?.[0]?.message ?? undefined;

      if (status === 401) {
        throw new Error(serverMessage ?? "Your current password is incorrect.");
      }
      if (status === 403) {
        throw new Error(serverMessage ?? "You don't have permission to change this password.");
      }
      if (status === 400 || status === 422) {
        throw new Error(serverMessage ?? "Please check the information you entered.");
      }
      if (status === 429) {
        throw new Error(
          serverMessage ?? "Too many attempts. Please wait a moment and try again.",
        );
      }
      if (status && status >= 500) {
        throw new Error("Our service is temporarily unavailable. Please try again shortly.");
      }
      throw new Error(serverMessage ?? "We couldn't update your password. Please try again.");
    }
    throw new Error("Network error — please check your connection and try again.");
  }
}

/**
 * Calls `POST /api/auth/login`.
 *
 * Returns a fully normalized `AuthResult` (token + user + workspace metadata).
 * Throws an `Error` with a user-facing message on any non-success outcome.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResult> {
  try {
    const { data } = await apiClient.post<RawAuthResponse>(endpoints.auth.login, payload);
    const raw = data.data ?? {};
    const token = pickToken(raw);
    if (!token) {
      throw new Error("Sign-in succeeded but no session token was returned. Please contact support.");
    }
    return {
      token,
      user: normalizeUser(raw, payload.email),
      onboardingStep: raw.onboardingStep,
      redirectTo: raw.redirectTo,
    };
  } catch (err) {
    if (err instanceof Error && !isAxiosError(err)) {
      // Preserve the message we threw above (e.g. "no session token").
      throw err;
    }
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const body = err.response?.data as
        | { message?: string; error?: string; errors?: Array<{ message?: string }> }
        | undefined;
      const serverMessage =
        body?.message ?? body?.error ?? body?.errors?.[0]?.message ?? undefined;

      if (status === 401 || status === 403) {
        throw new Error(serverMessage ?? "Incorrect email or password.");
      }
      if (status === 404) {
        throw new Error(serverMessage ?? "No account found with that email.");
      }
      if (status === 423) {
        throw new Error(serverMessage ?? "This account is locked. Contact your workspace admin.");
      }
      if (status === 429) {
        throw new Error(
          serverMessage ?? "Too many sign-in attempts. Please wait a moment and try again.",
        );
      }
      if (status === 400 || status === 422) {
        throw new Error(serverMessage ?? "Please check the information you entered.");
      }
      if (status && status >= 500) {
        throw new Error("Our service is temporarily unavailable. Please try again shortly.");
      }
      throw new Error(serverMessage ?? "We couldn't sign you in. Please try again.");
    }
    throw new Error("Network error — please check your connection and try again.");
  }
}
