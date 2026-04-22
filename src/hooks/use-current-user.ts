"use client";

import { authStore } from "@/stores/auth.store";

export const useCurrentUser = () => authStore((s) => s.user);
