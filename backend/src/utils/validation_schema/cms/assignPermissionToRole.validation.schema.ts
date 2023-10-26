import { z } from "zod";

export const assignPermissionToRoleValidationSchema = z.object({
  permissions: z.array(
    z.string().uuid({
      message: "Invalid permission uuid",
    })
  ),
});

export type AssignPermissionToRoleType = z.infer<typeof assignPermissionToRoleValidationSchema>;
