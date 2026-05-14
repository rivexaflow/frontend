import { z } from "zod";

/**
 * Matches `POST /api/auth/change-password` body:
 *   { currentPassword: string; newPassword: string }
 *
 * `confirmPassword` is enforced client-side only and stripped before the
 * request is dispatched (`toChangePasswordPayload`).
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const toChangePasswordPayload = (
  values: ChangePasswordFormValues,
): ChangePasswordPayload => ({
  currentPassword: values.currentPassword,
  newPassword: values.newPassword,
});
