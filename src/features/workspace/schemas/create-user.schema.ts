import { z } from "zod";

import { WORKSPACE_PROFILE_ROLES } from "@/features/workspace/data/workspace-user-roles";

export const createWorkspaceUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid work email"),
  profileRole: z.enum(WORKSPACE_PROFILE_ROLES, { message: "Select a profile role" }),
  department: z.string().optional(),
  team: z.string().optional(),
  reportingTo: z.string().optional(),
  mobile: z.string().optional(),
  extension1: z.string().optional(),
  extension2: z.string().optional(),
  loginEnabled: z.boolean(),
  activeStatus: z.boolean(),
  accessibleDepartments: z.string().optional(),
  accessibleUsers: z.string().optional(),
  allowedIps: z.string().optional(),
  kycPortalAccess: z.boolean(),
});

export type CreateWorkspaceUserInput = z.infer<typeof createWorkspaceUserSchema>;
