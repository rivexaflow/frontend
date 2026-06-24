import { z } from "zod";

/** Matches api-docs `UserRole`: owner | manager | freelancer */
export const profileRoleSchema = z.enum(["owner", "manager", "freelancer"]);

export const basicInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name (at least 2 characters).")
    .max(120, "Name is too long."),
  role: profileRoleSchema,
});

export const businessInfoSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Enter your business name.")
    .max(160, "Business name is too long."),
  industry: z.enum([
    "real_estate",
    "saas",
    "consulting",
    "healthcare",
    "finance",
    "ecommerce",
    "other",
  ]),
  teamSize: z.coerce
    .number()
    .int("Team size must be a whole number.")
    .min(1, "Team size must be at least 1.")
    .max(100_000, "Team size seems too large."),
  monthlyLeads: z.coerce.number().int().min(0).max(10_000_000).optional(),
  logo: z.string().optional(),
});

export type BasicInfoForm = z.infer<typeof basicInfoSchema>;
export type BusinessInfoForm = z.infer<typeof businessInfoSchema>;
