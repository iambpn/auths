import { eq, sql } from "drizzle-orm";
import { db } from "../schema/drizzle-migrate";
import { PermissionSchema, RolesPermissionsSchema, RolesSchema, UserSchema } from "../schema/drizzle-schema";
import { PaginatedResponse, PaginationQuery } from "../utils/helper/parsePagination";
import * as uuid from "uuid";
import { HttpError } from "../utils/helper/httpError";
import { CreateRoleType } from "../utils/validation_schema/cms/createRole.validation.schema";
import { AssignPermissionToRoleType } from "../utils/validation_schema/cms/assignPermissionToRole.validation.schema";

export async function getAllRoles(paginationQuery: ReturnType<typeof PaginationQuery>, searchKeyword?: string, returnPermission?: boolean) {
  const query = db.select().from(RolesSchema);

  if (searchKeyword) {
    query.where(sql`lower(${RolesSchema.name}) like ${searchKeyword.toLowerCase() + "%"}`);
  }

  const roles = await query.limit(paginationQuery.limit).offset(paginationQuery.skip);

  const rolesResponse: (typeof RolesSchema.$inferSelect & { permission: (typeof PermissionSchema.$inferSelect)[] })[] = [];

  if (returnPermission) {
    rolesResponse.push(
      ...(await Promise.all(
        roles.map(async (role) => {
          const permission = await db
            .select({
              permission: PermissionSchema,
            })
            .from(RolesPermissionsSchema)
            .innerJoin(PermissionSchema, eq(PermissionSchema.uuid, RolesPermissionsSchema.permissionUuid))
            .where(eq(RolesPermissionsSchema.roleUuid, role.uuid));

          return { ...role, permission: permission.map((x) => x.permission) };
        })
      ))
    );
  } else {
    rolesResponse.push(...roles.map((role) => ({ ...role, permission: [] })));
  }

  const countQuery = db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(RolesSchema);

  if (searchKeyword) {
    countQuery.where(sql`lower(${RolesSchema.name}) like ${searchKeyword.toLowerCase() + "%"}`);
  }

  const [count] = await countQuery;

  return {
    roles: rolesResponse,
    ...PaginatedResponse(count.count, paginationQuery),
  };
}

export async function getRoleById(id: string) {
  const [role] = await db.select().from(RolesSchema).where(eq(RolesSchema.uuid, id)).limit(1);

  if (!role) {
    throw new HttpError("Role not found.", 404);
  }

  const permissions = await db
    .select({
      permission: PermissionSchema,
    })
    .from(RolesPermissionsSchema)
    .innerJoin(PermissionSchema, eq(RolesPermissionsSchema.permissionUuid, PermissionSchema.uuid))
    .where(eq(RolesPermissionsSchema.roleUuid, role.uuid));

  return { ...role, permissions: permissions.map((x) => x.permission) };
}

export async function getRoleBySlug(slug: string) {
  const [role] = await db.select().from(RolesSchema).where(eq(RolesSchema.slug, slug)).limit(1);

  if (!role) {
    throw new HttpError("Role not found.", 404);
  }

  const permissions = await db
    .select({
      permission: PermissionSchema,
    })
    .from(RolesPermissionsSchema)
    .innerJoin(PermissionSchema, eq(RolesPermissionsSchema.permissionUuid, PermissionSchema.uuid))
    .where(eq(RolesPermissionsSchema.roleUuid, role.uuid));

  return { ...role, permissions: permissions.map((x) => x.permission) };
}

export async function createRole(roleData: CreateRoleType) {
  const [role] = await db
    .insert(RolesSchema)
    .values({
      name: roleData.name,
      slug: roleData.slug,
      uuid: uuid.v4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return role;
}

export async function updateRole(id: string, roleData: CreateRoleType) {
  const roleById = await getRoleById(id);

  const [role] = await db
    .update(RolesSchema)
    .set({
      name: roleData.name,
      slug: roleData.slug,
      updatedAt: new Date(),
    })
    .where(eq(RolesSchema.uuid, roleById.uuid))
    .returning();

  return role;
}

export async function deleteRole(id: string) {
  const roleById = await getRoleById(id);

  const usersByRoles = await db.select().from(UserSchema).where(eq(UserSchema.role, roleById.uuid));

  if (usersByRoles.length > 0) {
    throw new HttpError("Roles in use, cannot delete.", 409);
  }

  const [role] = await db.delete(RolesSchema).where(eq(RolesSchema.uuid, roleById.uuid)).returning();

  return role;
}

export async function assignPermissionsToRole(id: string, data: AssignPermissionToRoleType) {
  const roleById = await getRoleById(id);

  const assignedPermissions = await db
    .select({
      permissionUuid: RolesPermissionsSchema.permissionUuid,
    })
    .from(RolesPermissionsSchema)
    .where(eq(RolesPermissionsSchema.roleUuid, roleById.uuid));

  const newPermissionUuids = data.permissions
    .map((newPerm) => {
      return assignedPermissions.find((perm) => perm.permissionUuid === newPerm) ? undefined : newPerm;
    })
    .filter(Boolean) as string[];

  const removedPermissionUuids = assignedPermissions
    .map((perm) => {
      return data.permissions.find((newPerm) => perm.permissionUuid === newPerm) ? undefined : perm.permissionUuid;
    })
    .filter(Boolean) as string[];

  const insertablePermissions = newPermissionUuids.map((permission): typeof RolesPermissionsSchema.$inferInsert => ({
    roleUuid: roleById.uuid,
    permissionUuid: permission,
    uuid: uuid.v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const insertedRolePermissionUuids: (typeof RolesPermissionsSchema.$inferSelect)[] = [];
  if (insertablePermissions.length > 0) {
    const returnedValue = await db.insert(RolesPermissionsSchema).values(insertablePermissions).returning();
    insertedRolePermissionUuids.push(...returnedValue);
  }

  const removedRolePermissionUuids = await db
    .delete(RolesPermissionsSchema)
    .where(sql`${RolesPermissionsSchema.permissionUuid} in ${removedPermissionUuids}`)
    .returning();

  return {
    removeUuid: removedRolePermissionUuids.map((x) => x.permissionUuid).filter(Boolean) as string[],
    insertedUuid: insertedRolePermissionUuids.map((x) => x.permissionUuid).filter(Boolean) as string[],
  };
}

export async function getSuperAdminRole() {
  const [superAdminRole] = await db.select().from(RolesSchema).where(eq(RolesSchema.slug, "superadmin")).limit(1);
  return superAdminRole;
}
