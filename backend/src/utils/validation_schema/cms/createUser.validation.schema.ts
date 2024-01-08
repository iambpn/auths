import { z } from "zod";

export const createUserValidationSchema = z.object({
  email: z.string().email({
    message: "Email must be a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  role: z.string().uuid({
    message: "Role must be a valid UUID",
  }),
});

export type CreateUserType = z.infer<typeof createUserValidationSchema>;
