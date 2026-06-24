"use client";

import { useEffect } from "react";

import {
  DEMO_WORKSPACE_GRAPH,
  mergeApiWorkspaces,
} from "@/features/workspace/data/workspace-graph-demo";
import { apiClient } from "@/lib/api/client";
import { workspaceGraphStore } from "@/stores/workspace-graph.store";

export function useWorkspaceGraphBootstrap() {
  const setGraph = workspaceGraphStore((s) => s.setGraph);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data } = await apiClient.get("/company");
        if (cancelled) return;
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setGraph(mergeApiWorkspaces(data.data, DEMO_WORKSPACE_GRAPH));
          return;
        }
      } catch {
        /* demo fallback */
      }
      if (!cancelled) setGraph(DEMO_WORKSPACE_GRAPH);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [setGraph]);
}
