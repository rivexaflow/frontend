import { z } from "zod";

const NAME_PATTERN = /^[\p{L}\s'.-]+$/u;
const PHONE_MIN_DIGITS = 8;

function digitCount(value: string): number {
  return value.replace(/\D/g, "").length;
}

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || digitCount(v) >= PHONE_MIN_DIGITS, "Enter a valid phone number (at least 8 digits)");

export const addEmployeeFormSchema = z
  .object({
    // Basic information
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(50, "First name is too long")
      .regex(NAME_PATTERN, "Invalid characters in first name"),
    middleName: z.string().trim().max(50).optional(),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(50, "Last name is too long")
      .regex(NAME_PATTERN, "Invalid characters in last name"),
    preferredName: z.string().trim().max(50).optional(),
    gender: z.string().trim().optional(),
    dateOfBirth: z.string().trim().optional(),
    maritalStatus: z.string().trim().optional(),
    nationality: z.string().trim().optional(),
    bloodGroup: z.string().trim().optional(),
    personalEmail: z.string().trim().email("Enter a valid personal email").optional().or(z.literal("")),
    personalMobile: optionalPhone,
    profilePicturePreview: z.string().optional(),

    // Work contact
    email: z
      .string()
      .trim()
      .min(1, "Work email is required")
      .email("Enter a valid work email")
      .max(254, "Email is too long"),
    phone: optionalPhone,

    // Employment
    designation: z
      .string()
      .trim()
      .min(2, "Designation is required")
      .max(80, "Designation must be under 80 characters"),
    departmentId: z.string().optional(),
    departmentName: z.string().trim().optional(),
    employmentType: z.enum(["full_time", "part_time", "contract", "intern", "freelancer"], {
      message: "Select an employment type",
    }),
    employmentStatus: z.enum(["active", "probation", "offboarding", "resigned", "terminated"], {
      message: "Select employment status",
    }),
    joiningDate: z
      .string()
      .min(1, "Joining date is required")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid joining date"),
    confirmationDate: z.string().trim().optional(),
    employeeCategory: z.string().trim().optional(),
    teamLead: z.string().trim().optional(),
    location: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || v.length >= 2, "Location must be at least 2 characters"),
    officeBranch: z.string().trim().optional(),
    costCenter: z.string().trim().optional(),
    gradeBand: z.string().trim().optional(),
    shiftAssignment: z.string().trim().optional(),
    workMode: z.enum(["onsite", "hybrid", "remote"], {
      message: "Select a work mode",
    }),
    managerId: z.string().optional(),
    hrRoleId: z.string().optional(),

    // Organization
    businessUnit: z.string().trim().optional(),
    division: z.string().trim().optional(),
    team: z.string().trim().optional(),
    skipLevelManager: z.string().trim().optional(),
    hrManager: z.string().trim().optional(),

    // Contact
    addressLine1: z.string().trim().optional(),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    emergencyName: z.string().trim().optional(),
    emergencyRelationship: z.string().trim().optional(),
    emergencyMobile: optionalPhone,
  })
  .superRefine((data, ctx) => {
    if (!data.departmentId && !data.departmentName?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Select a department or enter a new one",
        path: ["departmentId"],
      });
    }
  });

export type AddEmployeeFormValues = z.infer<typeof addEmployeeFormSchema>;

export type AddEmployeeFormStep = "basic" | "employment" | "organization" | "contact";

const STEP_FIELDS: Record<AddEmployeeFormStep, (keyof AddEmployeeFormValues)[]> = {
  basic: [
    "firstName",
    "middleName",
    "lastName",
    "preferredName",
    "gender",
    "dateOfBirth",
    "maritalStatus",
    "nationality",
    "bloodGroup",
    "personalEmail",
    "personalMobile",
    "email",
    "phone",
  ],
  employment: [
    "designation",
    "departmentId",
    "departmentName",
    "employmentType",
    "employmentStatus",
    "joiningDate",
    "confirmationDate",
    "employeeCategory",
    "teamLead",
    "location",
    "officeBranch",
    "costCenter",
    "gradeBand",
    "shiftAssignment",
    "workMode",
    "managerId",
    "hrRoleId",
  ],
  organization: ["businessUnit", "division", "team", "skipLevelManager", "hrManager"],
  contact: [
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "country",
    "postalCode",
    "emergencyName",
    "emergencyRelationship",
    "emergencyMobile",
  ],
};

export function buildFullName(values: Pick<AddEmployeeFormValues, "firstName" | "middleName" | "lastName">) {
  return [values.firstName, values.middleName, values.lastName].filter(Boolean).join(" ");
}

export function validateAddEmployeeForm(values: AddEmployeeFormValues) {
  const result = addEmployeeFormSchema.safeParse(values);
  if (result.success) {
    return { success: true as const, data: result.data, errors: {} as Partial<Record<keyof AddEmployeeFormValues, string>> };
  }

  const errors: Partial<Record<keyof AddEmployeeFormValues, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof AddEmployeeFormValues;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { success: false as const, data: null, errors };
}

export function validateAddEmployeeStep(step: AddEmployeeFormStep, values: AddEmployeeFormValues) {
  const fields = STEP_FIELDS[step];
  const full = validateAddEmployeeForm(values);
  if (full.success) return full;

  const stepErrors: Partial<Record<keyof AddEmployeeFormValues, string>> = {};
  for (const field of fields) {
    if (full.errors[field]) stepErrors[field] = full.errors[field];
  }

  if (Object.keys(stepErrors).length === 0) {
    return { success: true as const, data: values, errors: {} as Partial<Record<keyof AddEmployeeFormValues, string>> };
  }
  return { success: false as const, data: null, errors: stepErrors };
}
