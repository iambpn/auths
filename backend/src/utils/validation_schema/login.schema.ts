import { createInsertSchema } from "drizzle-zod";
import { UserSchema } from "../../schema/drizzle-schema";
import { z } from "zod";

export const LoginValidationSchema = createInsertSchema(UserSchema, {
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/[A-Za-z]/, { message: "Password must contain at least one letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one digit" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" }),
}).pick({ email: true, password: true });

export type LoginValidationType = z.infer<typeof LoginValidationSchema>;
