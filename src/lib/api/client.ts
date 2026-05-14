"use client";

import axios from "axios";

import { authStore } from "@/stores/auth.store";

/**
 * Base URL for the Rivexa SaaS Platform API.
 *
 * Driven by `NEXT_PUBLIC_API_BASE_URL` (see `.env` / `.env.example`).
 * In production this points at `https://rivexaflow.in/api`; we fall back to
 * the same value rather than a localhost URL so the app keeps working if the
 * env var is forgotten during deploy. Local backends should override via
 * `.env.local`.
 */
const FALLBACK_BASE_URL = "https://rivexaflow.in/api";

const resolveBaseUrl = (): string => {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
  const base = raw.length > 0 ? raw : FALLBACK_BASE_URL;
  // Strip any trailing slash so endpoint paths (which all start with "/")
  // never accidentally produce "//".
  return base.replace(/\/+$/, "");
};

export const API_BASE_URL = resolveBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Client": "rivexaflow-web",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Global 401 handler: clear session + bounce to /login *unless* the failing
 * request was itself an auth call (login / register / refresh) — those need
 * to surface the error inline on the form instead of yanking the user away.
 */
const isAuthEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return /\/auth\/(login|register|refresh|logout)\b/.test(url);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url: string | undefined = error?.config?.url;
    if (status === 401 && !isAuthEndpoint(url)) {
      authStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
