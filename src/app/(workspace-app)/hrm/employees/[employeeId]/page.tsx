import { Suspense } from "react";

import { HrmEmployeeProfileView } from "@/features/workspace/views/hrm-employee-profile-view";

type Props = {
  params: Promise<{ employeeId: string }>;
};

export default async function HrmEmployeeProfilePage({ params }: Props) {
  const { employeeId } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-sm text-slate-500">
          Loading employee profile…
        </div>
      }
    >
      <HrmEmployeeProfileView employeeId={employeeId} />
    </Suspense>
  );
}
