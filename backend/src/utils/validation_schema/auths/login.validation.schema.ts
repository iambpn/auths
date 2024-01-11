import { z } from "zod";

export const LoginValidationSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must contains minimum of 8 characters" }),
});

export type LoginValidationType = z.infer<typeof LoginValidationSchema>;
