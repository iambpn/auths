import { eq, sql } from "drizzle-orm";
import * as uuid from "uuid";
import { db } from "../schema/drizzle-migrate";
import { PermissionSchema, RolesPermissionsSchema, RolesSchema } from "../schema/drizzle-schema";
import { HttpError } from "../utils/helper/httpError";
import { PaginatedResponse, PaginationQuery } from "../utils/helper/parsePagination";
import { AssignRoleToPermissionType } from "../utils/validation_schema/cms/assignRoleToPermission.validation.schema";
import { CreatePermissionType } from "../utils/validation_schema/cms/createPermission.validation.schema";

export async function getAllPermission(paginationQuery: ReturnType<typeof PaginationQuery>, searchKeyword?: string) {
  const query = db.select().from(PermissionSchema);

  if (searchKeyword) {
    query.where(sql`lower(${PermissionSchema.name}) like ${searchKeyword.toLowerCase() + "%"}`);
  }

  const permissions = await query.limit(paginationQuery.limit).offset(paginationQuery.skip);

  const countQuery = db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(PermissionSchema);

  if (searchKeyword) {
    countQuery.where(sql`lower(${PermissionSchema.name}) like ${searchKeyword.toLowerCase() + "%"}`);
  }

  const [count] = await countQuery;
  return { permissions, ...PaginatedResponse(count.count, paginationQuery) };
}

export async function getRolesByPermission(id: string, paginationQuery: ReturnType<typeof PaginationQuery>) {
  const query = db
    .select({
      roles: RolesSchema,
    })
    .from(RolesSchema)
    .innerJoin(RolesPermissionsSchema, eq(RolesPermissionsSchema.roleUuid, RolesSchema.uuid))
    .innerJoin(PermissionSchema, eq(PermissionSchema.uuid, RolesPermissionsSchema.permissionUuid))
    .where(eq(PermissionSchema.uuid, id));

  const roles = await query.limit(paginationQuery.limit).offset(paginationQuery.skip);

  const [count] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(RolesSchema)
    .innerJoin(RolesPermissionsSchema, eq(RolesPermissionsSchema.roleUuid, RolesSchema.uuid))
    .innerJoin(PermissionSchema, eq(PermissionSchema.uuid, RolesPermissionsSchema.permissionUuid))
    .where(eq(PermissionSchema.uuid, id));

  return {
    roles: roles.map((x) => x.roles),
    ...PaginatedResponse(count.count, paginationQuery),
  };
}

export async function getPermissionById(id: string) {
  const [permission] = await db.select().from(PermissionSchema).where(eq(PermissionSchema.uuid, id)).limit(1);

  if (!permission) {
    throw new HttpError("Permission not found.", 404);
  }

  return permission;
}

export async function createPermission(permissionData: CreatePermissionType) {
  // Check if permission with the same slug exists
  const [existingPermission] = await db.select().from(PermissionSchema).where(eq(PermissionSchema.slug, permissionData.slug)).limit(1);

  if (existingPermission) {
    throw new HttpError("Permission with the same slug already exists.", 409);
  }

  const [permission] = await db
    .insert(PermissionSchema)
    .values({
      name: permissionData.name,
      slug: permissionData.slug,
      uuid: uuid.v4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return permission;
}

export async function updatePermission(id: string, permissionData: CreatePermissionType) {
  const permissionById = await getPermissionById(id);

  // permission by slug
  const [permissionBySlug] = await db.select().from(PermissionSchema).where(eq(PermissionSchema.slug, permissionData.slug)).limit(1);

  if (permissionBySlug && permissionBySlug.uuid !== permissionById.uuid) {
    throw new HttpError("Permission with the same slug already exists.", 409);
  }

  const [permission] = await db
    .update(PermissionSchema)
    .set({
      name: permissionData.name,
      slug: permissionData.slug,
      updatedAt: new Date(),
    })
    .where(eq(PermissionSchema.uuid, permissionById.uuid))
    .returning();

  return permission;
}

export async function deletePermission(id: string) {
  const permissionById = await getPermissionById(id);

  const roles = await db
    .select({
      uuid: RolesPermissionsSchema.uuid,
      roleUUid: RolesPermissionsSchema.roleUuid,
    })
    .from(RolesPermissionsSchema)
    .innerJoin(RolesSchema, eq(RolesPermissionsSchema.roleUuid, RolesSchema.uuid));

  if (roles.length > 0) {
    throw new HttpError("Permission in use, cannot delete.", 400);
  }

  const [permission] = await db.delete(PermissionSchema).where(eq(PermissionSchema.uuid, permissionById.uuid)).returning();

  return permission;
}

export async function assignRolesToPermission(id: string, data: AssignRoleToPermissionType) {
  const permissionById = await getPermissionById(id);

  const assignedRoles = await db
    .select({
      rolesUuid: RolesPermissionsSchema.roleUuid,
    })
    .from(RolesPermissionsSchema)
    .where(eq(RolesPermissionsSchema.permissionUuid, permissionById.uuid));

  const newRoleUuids = data.roles
    .map((newRoleUuid) => {
      return assignedRoles.find((oldRole) => oldRole.rolesUuid === newRoleUuid) ? undefined : newRoleUuid;
    })
    .filter(Boolean) as string[];

  const removedRoleUuids = assignedRoles
    .map((oldRole) => {
      return data.roles.find((newRoleUuid) => oldRole.rolesUuid === newRoleUuid) ? undefined : oldRole.rolesUuid;
    })
    .filter(Boolean) as string[];

  const insertableRoles = newRoleUuids.map((role): typeof RolesPermissionsSchema.$inferInsert => ({
    roleUuid: role,
    permissionUuid: permissionById.uuid,
    uuid: uuid.v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const insertedRolePermissionUuids: (typeof RolesPermissionsSchema.$inferSelect)[] = [];

  if (insertableRoles.length > 0) {
    insertedRolePermissionUuids.push(...(await db.insert(RolesPermissionsSchema).values(insertableRoles).returning()));
  }

  const removedRolePermissionUuids = await db
    .delete(RolesPermissionsSchema)
    .where(sql`${RolesPermissionsSchema.roleUuid} in ${removedRoleUuids}`)
    .returning();

  return {
    removeUuid: removedRolePermissionUuids.map((x) => x.roleUuid).filter(Boolean) as string[],
    insertedUuid: insertedRolePermissionUuids.map((x) => x.roleUuid).filter(Boolean) as string[],
  };
}
