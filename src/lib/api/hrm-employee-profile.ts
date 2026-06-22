import { fetchHrEmployee } from "@/lib/api/hrm";
import { buildEmployeeProfile } from "@/features/workspace/data/hrm-employee-profile-demo";
import type { HrmEmployeeProfile } from "@/types/hrm";

/** Load directory record from API and merge extended profile sections. */
export async function fetchHrEmployeeProfile(
  companyId: string,
  employeeId: string,
): Promise<HrmEmployeeProfile> {
  const record = await fetchHrEmployee(companyId, employeeId);
  return buildEmployeeProfile(record);
}
