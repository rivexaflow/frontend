"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CrmImportPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/migration");
  }, [router]);
  
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#191970] border-t-transparent" />
    </div>
  );
}
