import { z } from "zod";

export const SetSecurityQnASchema = z.object({
  question1: z.coerce.number().gte(1, {
    message: "Question 1 cannot be less than 1",
  }),
  question2: z.coerce.number().gte(1, {
    message: "Question 2 cannot be less than 1",
  }),
  answer1: z.string().min(2, {
    message: "Answer 1 must be at least 2 characters",
  }),
  answer2: z.string().min(2, {
    message: "Answer 2 must be at least 2 characters",
  }),
});

export type SetSecurityQnAType = z.infer<typeof SetSecurityQnASchema>;
