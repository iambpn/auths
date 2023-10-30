import { z } from "zod";

export const UpdatePasswordValidationSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: "Password is required",
      })
      .min(8, {
        message: "Password must be at least 8 characters long",
      }),
    newPassword: z
      .string({
        required_error: "New Password is required",
      })
      .min(8, {
        message: "New Password must be at least 8 characters long",
      }),
    confirmPassword: z
      .string({
        required_error: "Confirm Password is required",
      })
      .min(8, {
        message: "Confirm Password must be same as New Password",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm Password must be same as New Password",
    path: ["confirmPassword"], // specify where this error belongs to
  });

export type UpdatePasswordValidationType = z.infer<typeof UpdatePasswordValidationSchema>;
