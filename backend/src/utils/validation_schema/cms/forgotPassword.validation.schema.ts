import { z } from "zod";

export const ForgotPasswordValidationSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  answer1: z.string().min(2, {
    message: "Answer 1 must be at least 2 characters",
  }),
  answer2: z.string().min(2, {
    message: "Answer 2 must be at least 2 characters",
  }),
});

export type ForgotPasswordType = z.infer<typeof ForgotPasswordValidationSchema>;
