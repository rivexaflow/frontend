import { z } from "zod";

export const kycCaseFormSchema = z.object({
  applicantName: z.string().trim().min(2, "Applicant name is required"),
  company: z.string().trim().min(2, "Company or entity name is required"),
  email: z.string().trim().email("Enter a valid email"),
  verificationType: z.enum([
    "individual_kyc",
    "corporate_kyb",
    "ubo_verification",
    "enhanced_due_diligence",
  ]),
  jurisdiction: z.string().trim().min(2, "Jurisdiction is required"),
  owner: z.string().trim().min(2, "Case owner is required"),
});

export type KycCaseFormValues = z.infer<typeof kycCaseFormSchema>;
