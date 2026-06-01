import { ReactNode } from "react";

import { WorkspaceAppRoot } from "@/features/workspace/components/workspace-app-root";

export default function WorkspaceAppLayout({ children }: { children: ReactNode }) {
  return <WorkspaceAppRoot>{children}</WorkspaceAppRoot>;
}
