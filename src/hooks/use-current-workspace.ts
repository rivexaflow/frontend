"use client";

import { workspaceStore } from "@/stores/workspace.store";

export const useCurrentWorkspace = () => workspaceStore();
