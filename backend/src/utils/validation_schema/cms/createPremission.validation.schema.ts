import { z } from "zod";

export const createPermissionValidationSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters long",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters long",
  }),
});

export type CreatePermissionType = z.infer<typeof createPermissionValidationSchema>;
