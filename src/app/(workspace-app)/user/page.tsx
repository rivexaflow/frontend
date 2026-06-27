import { Suspense } from "react";

import { UserManagementUsersView } from "@/features/workspace/views/user-management-users-view";

export default function UserManagementPage() {
  return (
    <Suspense>
      <UserManagementUsersView />
    </Suspense>
  );
}
