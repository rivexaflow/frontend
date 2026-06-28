"use client";

import { useEffect } from "react";

import { apiClient } from "@/lib/api/client";
import { workspaceGraphStore } from "@/stores/workspace-graph.store";
import { workspaceStore } from "@/stores/workspace.store";
import type { WorkspaceGraphNode } from "@/types/workspace-graph";

export function useWorkspaceGraphBootstrap() {
  const setGraph = workspaceGraphStore((s) => s.setGraph);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { workspaceId, workspaceName, brandName, plan, modules } = workspaceStore.getState();
      const companyTitle = (brandName || workspaceName || "My Company").trim();
      
      let realCompanies: any[] = [];
      try {
        const { data } = await apiClient.get("/company");
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          realCompanies = data.data;
        }
      } catch (err) {
        console.error("Failed to load company graph list:", err);
      }

      if (cancelled) return;

      if (realCompanies.length > 0) {
        const nodes: WorkspaceGraphNode[] = realCompanies.map((c, idx) => ({
          id: c.id || `ws_${idx}`,
          name: c.name || c.brandName || "Workspace",
          slug: c.slug || c.id || `ws-${idx}`,
          parentId: idx === 0 ? null : realCompanies[0].id,
          modules: (c.modules && c.modules.length > 0 ? c.modules : ["crm", "deals", "kyc"]) as any[],
          employeeCount: c.employeeCount || 10,
          plan: c.plan || c.size || "Growth",
          isMain: idx === 0,
          status: "active",
          createdAt: "Active",
          adminName: "Workspace Lead",
          adminEmail: `admin@${c.slug || "company"}.com`,
        }));

        const edges = nodes.slice(1).map((node) => ({
          id: `h_${nodes[0].id}_${node.id}`,
          sourceId: nodes[0].id,
          targetId: node.id,
          type: "hierarchy" as const,
          crossAccess: true,
          createdAt: "Active",
          sharedDomains: ["employees", "crm", "hrm"] as any[],
        }));

        setGraph({
          organizationName: `${nodes[0].name} Organization`,
          nodes,
          edges,
        });
      } else {
        // Single Active Workspace Default (NO Demo Data)
        const mainNode: WorkspaceGraphNode = {
          id: workspaceId || "main_ws",
          name: companyTitle,
          slug: (workspaceName || "workspace").toLowerCase().replace(/\s+/g, "-"),
          parentId: null,
          modules: (modules && modules.length > 0 ? modules : ["crm", "deals", "kyc", "hrm"]) as any[],
          employeeCount: 12,
          plan: plan || "Growth",
          isMain: true,
          status: "active",
          createdAt: "Active",
          adminName: "Workspace Lead",
          adminEmail: `admin@${(workspaceName || "company").toLowerCase().replace(/\s+/g, "")}.com`,
        };

        setGraph({
          organizationName: `${companyTitle} Organization`,
          nodes: [mainNode],
          edges: [],
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [setGraph]);
}
