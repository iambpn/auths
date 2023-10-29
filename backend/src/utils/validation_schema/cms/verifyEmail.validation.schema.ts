import { z } from "zod";

export const validateEmailSchema = z.object({
  email: z.string().email({
    message: "Email must be a valid email",
  }),
});

export type ValidateEmailType = z.infer<typeof validateEmailSchema>;
