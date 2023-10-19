import { createInsertSchema } from "drizzle-zod";
import { UserSchema } from "../../../schema/drizzle-schema";
import { z } from "zod";

export const LoginValidationSchema = createInsertSchema(UserSchema, {
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must contains minimum of 8 characters" }),
}).pick({ email: true, password: true });

export type LoginValidationType = z.infer<typeof LoginValidationSchema>;
