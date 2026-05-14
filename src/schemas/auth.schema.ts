import { z } from "zod";

/**
 * Matches `POST /api/auth/register` body:
 *   { email: string; password: string; fullName: string }
 *
 * Validation is intentionally aligned with the backend contract — the API
 * accepts an 8-character password (e.g. "stringst"), so we don't impose
 * additional complexity rules that the server wouldn't enforce.
 */
export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid work email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export type RegisterPayload = z.infer<typeof registerSchema>;

/**
 * Matches `POST /api/auth/login` body:
 *   { email: string; password: string }
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid work email"),
  password: z
    .string()
    .min(1, "Please enter your password"),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
