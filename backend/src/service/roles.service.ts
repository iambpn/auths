import { asc, eq, sql } from "drizzle-orm";
import * as uuid from "uuid";
import { db } from "../dbSchema/drizzle-migrate";
import { schema } from "../dbSchema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { HttpError } from "../utils/helper/httpError";
import { PaginatedResponse, PaginationQuery } from "../utils/helper/parsePagination";
import { AssignPermissionToRoleType } from "../utils/validation_schema/cms/assignPermissionToRole.validation.schema";
import { CreateRoleType } from "../utils/validation_schema/cms/createRole.validation.schema";

export async function getAllRoles(paginationQuery: ReturnType<typeof PaginationQuery>, searchKeyword?: string, withPermission?: string) {
  const query = db.select().from(schema.RolesSchema);

  if (searchKeyword) {
    query.where(sql`lower(${schema.RolesSchema.name}) like ${searchKeyword.toLowerCase() + "%"}`);
  }

  const roles = await query.limit(paginationQuery.limit).offset(paginationQuery.skip).orderBy(asc(schema.RolesSchema.updatedAt));

  const rolesResponse: (typeof schema.RolesSchema.$inferSelect & { permission: (typeof schema.PermissionSchema.$inferSelect)[] })[] = [];

  if (withPermission === "true") {
    rolesResponse.push(
      ...(await Promise.all(
        roles.map(async (role) => {
          const permission = await db
            .select({
              permission: schema.PermissionSchema,
            })
            .from(schema.RolesPermissionsSchema)
            .innerJoin(schema.PermissionSchema, eq(schema.PermissionSchema.uuid, schema.RolesPermissionsSchema.permissionUuid))
            .where(eq(schema.RolesPermissionsSchema.roleUuid, role.uuid))
            .orderBy(asc(schema.PermissionSchema.updatedAt));

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
    .from(schema.RolesSchema);

  if (searchKeyword) {
    countQuery.where(sql`lower(${schema.RolesSchema.name}) like ${searchKeyword.toLowerCase() + "%"}`);
  }

  const [count] = await countQuery;

  return {
    roles: rolesResponse,
    ...PaginatedResponse(count.count, paginationQuery),
  };
}

export async function getRoleById(id: string) {
  const [role] = await db.select().from(schema.RolesSchema).where(eq(schema.RolesSchema.uuid, id)).limit(1);

  if (!role) {
    throw new HttpError("Role not found.", 404);
  }

  const permissions = await db
    .select({
      permission: schema.PermissionSchema,
    })
    .from(schema.RolesPermissionsSchema)
    .innerJoin(schema.PermissionSchema, eq(schema.RolesPermissionsSchema.permissionUuid, schema.PermissionSchema.uuid))
    .where(eq(schema.RolesPermissionsSchema.roleUuid, role.uuid))
    .orderBy(asc(schema.PermissionSchema.updatedAt));

  return { ...role, permissions: permissions.map((x) => x.permission) };
}

export async function getRoleBySlug(slug: string) {
  const [role] = await db.select().from(schema.RolesSchema).where(eq(schema.RolesSchema.slug, slug)).limit(1);

  if (!role) {
    throw new HttpError("Role not found.", 404);
  }

  const permissions = await db
    .select({
      permission: schema.PermissionSchema,
    })
    .from(schema.RolesPermissionsSchema)
    .innerJoin(schema.PermissionSchema, eq(schema.RolesPermissionsSchema.permissionUuid, schema.PermissionSchema.uuid))
    .where(eq(schema.RolesPermissionsSchema.roleUuid, role.uuid))
    .orderBy(asc(schema.PermissionSchema.updatedAt));

  return { ...role, permissions: permissions.map((x) => x.permission) };
}

export async function createRole(roleData: CreateRoleType) {
  // Check if role with the same slug exists
  const [existingRole] = await db.select().from(schema.RolesSchema).where(eq(schema.RolesSchema.slug, roleData.slug)).limit(1);

  if (existingRole) {
    throw new HttpError("Role with the same slug already exists.", 409);
  }

  await db.insert(schema.RolesSchema).values({
    name: roleData.name,
    slug: roleData.slug,
    uuid: uuid.v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [role] = await db.select().from(schema.RolesSchema).where(eq(schema.RolesSchema.slug, roleData.slug)).limit(1);

  return role;
}

export async function updateRole(id: string, roleData: CreateRoleType) {
  const roleById = await getRoleById(id);

  // role by slug
  const [roleBySlug] = await db.select().from(schema.RolesSchema).where(eq(schema.RolesSchema.slug, roleData.slug)).limit(1);

  if (roleBySlug && roleBySlug.uuid !== roleById.uuid) {
    throw new HttpError("Role with the same slug already exists.", 409);
  }

  await db
    .update(schema.RolesSchema)
    .set({
      name: roleData.name,
      slug: roleData.slug,
      updatedAt: new Date(),
    })
    .where(eq(schema.RolesSchema.uuid, roleById.uuid));

  const [updatedRole] = await db.select().from(schema.RolesSchema).where(eq(schema.RolesSchema.uuid, roleById.uuid)).limit(1);

  return updatedRole;
}

export async function deleteRole(id: string) {
  const roleById = await getRoleById(id);

  if (roleById.slug === config.superAdminSlug) {
    throw new HttpError("Cannot delete super admin role.", 400);
  }

  const usersByRoles = await db
    .select()
    .from(schema.UserSchema)
    .where(eq(schema.UserSchema.role, roleById.uuid))
    .orderBy(asc(schema.UserSchema.updatedAt));

  if (usersByRoles.length > 0) {
    throw new HttpError("Roles in use, cannot delete.", 409);
  }

  await db.delete(schema.RolesSchema).where(eq(schema.RolesSchema.uuid, roleById.uuid));

  return { ...roleById, permissions: [] };
}

export async function assignPermissionsToRole(id: string, data: AssignPermissionToRoleType) {
  const roleById = await getRoleById(id);

  const assignedPermissions = await db
    .select({
      permissionUuid: schema.RolesPermissionsSchema.permissionUuid,
    })
    .from(schema.RolesPermissionsSchema)
    .where(eq(schema.RolesPermissionsSchema.roleUuid, roleById.uuid));

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

  const insertablePermissions = newPermissionUuids.map((permission): typeof schema.RolesPermissionsSchema.$inferInsert => ({
    roleUuid: roleById.uuid,
    permissionUuid: permission,
    uuid: uuid.v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  if (insertablePermissions.length > 0) {
    await db.insert(schema.RolesPermissionsSchema).values(insertablePermissions);
  }

  if (removedPermissionUuids.length > 0) {
    await db.delete(schema.RolesPermissionsSchema).where(sql`${schema.RolesPermissionsSchema.permissionUuid} in ${removedPermissionUuids}`);
  }

  return {
    removeUuid: removedPermissionUuids.flatMap((x) => (x ? [x] : [])),
    insertedUuid: insertablePermissions.map((x) => (x.permissionUuid ? [x.permissionUuid] : [])),
  };
}

export async function getSuperAdminRole() {
  const [superAdminRole] = await db.select().from(schema.RolesSchema).where(eq(schema.RolesSchema.slug, config.superAdminSlug)).limit(1);

  if (!superAdminRole) {
    throw new HttpError("Role not found", 400);
  }

  return superAdminRole;
}
