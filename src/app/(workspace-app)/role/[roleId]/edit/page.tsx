import { EditRoleView } from "@/features/workspace/views/edit-role-view";

type Props = {
  params: Promise<{ roleId: string }>;
};

export default async function EditRolePage({ params }: Props) {
  const { roleId } = await params;
  return <EditRoleView mode="edit" roleId={roleId} />;
}
