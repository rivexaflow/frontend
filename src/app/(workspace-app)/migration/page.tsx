"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CrmImportView } from "@/features/workspace/views/crm-import-view";
import { effectiveNavRole } from "@/types/auth";

export default function MigrationPage() {
  const user = useCurrentUser();
  const router = useRouter();
  
  const navRole = effectiveNavRole(user);
  const isOwnerOrAdmin = navRole === "ADMIN" || navRole === "SUPER_ADMIN";

  useEffect(() => {
    if (user && !isOwnerOrAdmin) {
      router.replace("/forbidden");
    }
  }, [user, isOwnerOrAdmin, router]);
  
  if (!user || !isOwnerOrAdmin) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#191970] border-t-transparent" />
      </div>
    );
  }
  
  return <CrmImportView />;
}
