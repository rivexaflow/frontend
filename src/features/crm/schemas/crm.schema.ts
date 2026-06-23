import { z } from "zod";

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  title: z.string().trim().min(2, "Job title is required"),
  company: z.string().trim().min(2, "Company is required"),
  email: z.string().trim().email("Enter a valid work email"),
  phone: z.string().trim().optional(),
  country: z.string().trim().min(2, "Country is required"),
  source: z.enum(["Inbound", "Outbound", "Partner", "Webinar", "Referral", "Paid ads", "Event"]),
  owner: z.string().trim().min(2, "Owner is required"),
});

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  company: z.string().trim().min(2, "Company is required"),
  email: z.string().trim().email("Enter a valid email"),
  role: z.string().trim().min(2, "Role or title is required"),
  owner: z.string().trim().min(2, "Owner is required"),
});

export const opportunityFormSchema = z.object({
  title: z.string().trim().min(3, "Deal name must be at least 3 characters"),
  company: z.string().trim().min(2, "Company is required"),
  value: z.coerce.number().positive("Amount must be greater than zero"),
  stageId: z.string().min(1, "Select a stage"),
  owner: z.string().trim().min(2, "Owner is required"),
  closeDate: z.string().min(1, "Expected close date is required"),
  priority: z.enum(["high", "medium", "low"]),
});

export const dealFormSchema = z.object({
  title: z.string().trim().min(3, "Deal name must be at least 3 characters"),
  company: z.string().trim().min(2, "Company is required"),
  contact: z.string().trim().min(2, "Primary contact is required"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.replace(/\D/g, "").length >= 8, "Enter a valid phone number"),
  value: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z.enum(["USD", "EUR", "GBP", "INR"]),
  stage: z.enum([
    "qualification",
    "discovery",
    "proposal",
    "negotiation",
    "closed_won",
    "closed_lost",
  ]),
  owner: z.string().trim().min(2, "Owner is required"),
  closeDate: z.string().min(1, "Expected close date is required"),
  priority: z.enum(["high", "medium", "low"]),
  source: z.enum(["Inbound", "Outbound", "Partner", "Webinar", "Referral", "Event"]),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type OpportunityFormValues = z.infer<typeof opportunityFormSchema>;
export type DealFormValues = z.infer<typeof dealFormSchema>;
