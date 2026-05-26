"use client";

import { useParams } from "next/navigation";
import { RoleDashboard } from "@/features/workspace/components/dashboard/role-dashboard";

export default function DashboardPage() {
  const params = useParams();
  const workspaceSlug = typeof params.workspaceSlug === "string" ? params.workspaceSlug : "acme-corp";
  return <RoleDashboard workspaceSlug={workspaceSlug} />;
}
