import { workspacePaths } from "@/lib/workspace/paths";

export function hrmEmployeeProfilePath(employeeId: string): string {
  return `${workspacePaths.hrmEmployees}/${employeeId}`;
}
