import { z } from "zod";

export const createRoleValidationSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters long",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters long",
  }),
});

export type CreateRoleType = z.infer<typeof createRoleValidationSchema>;
