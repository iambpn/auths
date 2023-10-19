import { z } from "zod";

export const ForgotPasswordValidationSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  question1: z.string().uuid({
    message: "Question 1 must be a valid uuid",
  }),
  question2: z.string().uuid({
    message: "Question 2 must be a valid uuid",
  }),
  answer1: z.string().min(2, {
    message: "Answer 1 must be at least 2 characters",
  }),
  answer2: z.string().min(2, {
    message: "Answer 2 must be at least 2 characters",
  }),
});

export type ForgotPasswordType = z.infer<typeof ForgotPasswordValidationSchema>;
