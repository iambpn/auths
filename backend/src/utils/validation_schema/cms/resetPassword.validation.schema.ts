import { z } from "zod";

export const ResetPasswordValidationSchema = z.object({
  token: z.string().min(6, { message: "Invalid Reset Token" }),
  newPassword: z.string().min(8, { message: "Password must contains minimum of 8 characters" }),
});

export type ResetPasswordValidationType = z.infer<typeof ResetPasswordValidationSchema>;
