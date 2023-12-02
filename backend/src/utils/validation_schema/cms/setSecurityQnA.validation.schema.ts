import { z } from "zod";

export const SetSecurityQnASchema = z.object({
  question1: z.coerce.number().gte(0, {
    message: "You must select a security Question 1",
  }),
  question2: z.coerce.number().gte(0, {
    message: "You must select a security Question 2",
  }),
  answer1: z.string().min(2, {
    message: "Answer 1 must be at least 2 characters long",
  }),
  answer2: z.string().min(2, {
    message: "Answer 2 must be at least 2 characters long",
  }),
});

export type SetSecurityQnAType = z.infer<typeof SetSecurityQnASchema>;
