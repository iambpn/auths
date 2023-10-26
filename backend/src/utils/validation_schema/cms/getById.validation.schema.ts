import { z } from "zod";

export const getByIdValidationSchema = z.object({
  id: z.string().uuid({
    message: "Must be a valid UUID",
  }),
});

export type GetByIdType = z.infer<typeof getByIdValidationSchema>;
