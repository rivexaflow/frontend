import { redirect } from "next/navigation";

import { roleEditPath } from "@/lib/workspace/paths";

type Props = {
  params: Promise<{ roleId: string }>;
};

export default async function LegacyUserRoleEditPage({ params }: Props) {
  const { roleId } = await params;
  redirect(roleEditPath(roleId));
}
