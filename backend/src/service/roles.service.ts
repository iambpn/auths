import { eq, sql } from "drizzle-orm";
import { db } from "../schema/drizzle-migrate";
import { PermissionSchema, RolesPermissionsSchema, RolesSchema, UserSchema } from "../schema/drizzle-schema";
import { PaginationQuery } from "../utils/helper/parsePagination";
import * as uuid from "uuid";
import { HttpError } from "../utils/helper/httpError";
import { CreateRoleType } from "../utils/validation_schema/cms/createRole.validation.schema";
import { AssignPermissionToRoleType } from "../utils/validation_schema/cms/assignPermissionToRole.validation.schema";

export async function getAllRoles(paginationQuery: ReturnType<typeof PaginationQuery>) {
  const roles = await db.select().from(RolesSchema).limit(paginationQuery.limit).offset(paginationQuery.skip);

  return await Promise.all(
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
  );
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

export async function assignPermission(id: string, data: AssignPermissionToRoleType) {
  const roleById = await getRoleById(id);

  const permissions = await db
    .select({
      permissionUuid: RolesPermissionsSchema.permissionUuid,
    })
    .from(RolesPermissionsSchema)
    .where(eq(RolesPermissionsSchema.roleUuid, roleById.uuid));

  const newPermission = data.permissions
    .map((newPerm) => {
      return permissions.find((perm) => perm.permissionUuid === newPerm) ? undefined : newPerm;
    })
    .filter(Boolean) as string[];

  const removedPermissions = permissions
    .map((perm) => {
      return data.permissions.find((newPerm) => perm.permissionUuid === newPerm) ? undefined : perm.permissionUuid;
    })
    .filter(Boolean) as string[];

  const insertedRolePermissionUuids = await db
    .insert(RolesPermissionsSchema)
    .values(
      newPermission.map((permission) => ({
        roleUuid: roleById.uuid,
        permission: permission,
        uuid: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )
    .returning();

  const removedRolePermissionUuids = await db
    .delete(RolesPermissionsSchema)
    .where(sql`${RolesPermissionsSchema.permissionUuid} in ${removedPermissions}`)
    .returning();

  return {
    removeUuid: removedRolePermissionUuids.map((x) => x.permissionUuid),
    insertedUuid: insertedRolePermissionUuids.map((x) => x.permissionUuid),
  };
}

export async function getSuperAdminRole() {
  const [superAdminRole] = await db.select().from(RolesSchema).where(eq(RolesSchema.slug, "superadmin")).limit(1);
  return superAdminRole;
}
