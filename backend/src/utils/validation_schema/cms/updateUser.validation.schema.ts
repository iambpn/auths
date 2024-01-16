import { z } from "zod";

export const updateUserValidationSchema = z.object({
  email: z.string().email({
    message: "Email must be a valid email address",
  }),
  role: z.string().uuid({
    message: "Role must be a valid UUID",
  }),
});

export type UpdateUserType = z.infer<typeof updateUserValidationSchema>;
