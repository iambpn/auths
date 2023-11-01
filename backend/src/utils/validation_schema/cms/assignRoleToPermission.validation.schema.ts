import { z } from "zod";

export const assignRoleToPermissionValidationSchema = z.object({
  roles: z.array(
    z.string().uuid({
      message: "Invalid roles uuid",
    })
  ),
});

export type AssignRoleToPermissionType = z.infer<typeof assignRoleToPermissionValidationSchema>;
