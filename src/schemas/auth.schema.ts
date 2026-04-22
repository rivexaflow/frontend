import { z } from "zod";

export const signupSchema = z.object({
  company: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});
