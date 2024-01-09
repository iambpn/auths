import { z } from "zod";

export const updateUserValidationSchema = z
  .object({
    email: z.string().email({
      message: "Email must be a valid email address",
    }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .optional(),
    confirmPassword: z
      .string()
      .min(8, {
        message: "Confirm password  must be at least 8 characters long",
      })
      .optional(),
    role: z.string().uuid({
      message: "Role must be a valid UUID",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm Password must be same as Password",
    path: ["confirmPassword"], // specify where this error belongs to
  });

export type UpdateUserType = z.infer<typeof updateUserValidationSchema>;
