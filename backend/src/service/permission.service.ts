import { eq, sql } from "drizzle-orm";
import * as uuid from "uuid";
import { db } from "../dbSchema/drizzle-migrate";
import { schema } from "../dbSchema/drizzle-schema";
import { HttpError } from "../utils/helper/httpError";
import { PaginatedResponse, PaginationQuery } from "../utils/helper/parsePagination";
import { AssignRoleToPermissionType } from "../utils/validation_schema/cms/assignRoleToPermission.validation.schema";
import { CreatePermissionType } from "../utils/validation_schema/cms/createPermission.validation.schema";

export async function getAllPermission(paginationQuery: ReturnType<typeof PaginationQuery>, searchKeyword?: string) {
  const query = db.select().from(schema.PermissionSchema);

  if (searchKeyword) {
    query.where(sql`lower(${schema.PermissionSchema.name}) like ${searchKeyword.toLowerCase() + "%"}`);
  }

  const permissions = await query.limit(paginationQuery.limit).offset(paginationQuery.skip);

  const countQuery = db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(schema.PermissionSchema);

  if (searchKeyword) {
    countQuery.where(sql`lower(${schema.PermissionSchema.name}) like ${searchKeyword.toLowerCase() + "%"}`);
  }

  const [count] = await countQuery;
  return { permissions, ...PaginatedResponse(count.count, paginationQuery) };
}

export async function getRolesByPermission(id: string, paginationQuery: ReturnType<typeof PaginationQuery>) {
  const query = db
    .select({
      roles: schema.RolesSchema,
    })
    .from(schema.RolesSchema)
    .innerJoin(schema.RolesPermissionsSchema, eq(schema.RolesPermissionsSchema.roleUuid, schema.RolesSchema.uuid))
    .innerJoin(schema.PermissionSchema, eq(schema.PermissionSchema.uuid, schema.RolesPermissionsSchema.permissionUuid))
    .where(eq(schema.PermissionSchema.uuid, id));

  const roles = await query.limit(paginationQuery.limit).offset(paginationQuery.skip);

  const [count] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(schema.RolesSchema)
    .innerJoin(schema.RolesPermissionsSchema, eq(schema.RolesPermissionsSchema.roleUuid, schema.RolesSchema.uuid))
    .innerJoin(schema.PermissionSchema, eq(schema.PermissionSchema.uuid, schema.RolesPermissionsSchema.permissionUuid))
    .where(eq(schema.PermissionSchema.uuid, id));

  return {
    roles: roles.map((x) => x.roles),
    ...PaginatedResponse(count.count, paginationQuery),
  };
}

export async function getPermissionById(id: string) {
  const [permission] = await db.select().from(schema.PermissionSchema).where(eq(schema.PermissionSchema.uuid, id)).limit(1);

  if (!permission) {
    throw new HttpError("Permission not found.", 404);
  }

  return permission;
}

export async function createPermission(permissionData: CreatePermissionType) {
  // Check if permission with the same slug exists
  const [existingPermission] = await db.select().from(schema.PermissionSchema).where(eq(schema.PermissionSchema.slug, permissionData.slug)).limit(1);

  if (existingPermission) {
    throw new HttpError("Permission with the same slug already exists.", 409);
  }

  const [permission] = await db
    .insert(schema.PermissionSchema)
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
  const [permissionBySlug] = await db.select().from(schema.PermissionSchema).where(eq(schema.PermissionSchema.slug, permissionData.slug)).limit(1);

  if (permissionBySlug && permissionBySlug.uuid !== permissionById.uuid) {
    throw new HttpError("Permission with the same slug already exists.", 409);
  }

  const [permission] = await db
    .update(schema.PermissionSchema)
    .set({
      name: permissionData.name,
      slug: permissionData.slug,
      updatedAt: new Date(),
    })
    .where(eq(schema.PermissionSchema.uuid, permissionById.uuid))
    .returning();

  return permission;
}

export async function deletePermission(id: string) {
  const permissionById = await getPermissionById(id);

  const roles = await db
    .select({
      uuid: schema.RolesPermissionsSchema.uuid,
      roleUUid: schema.RolesPermissionsSchema.roleUuid,
    })
    .from(schema.RolesPermissionsSchema)
    .innerJoin(schema.RolesSchema, eq(schema.RolesPermissionsSchema.roleUuid, schema.RolesSchema.uuid));

  if (roles.length > 0) {
    throw new HttpError("Permission in use, cannot delete.", 400);
  }

  const [permission] = await db.delete(schema.PermissionSchema).where(eq(schema.PermissionSchema.uuid, permissionById.uuid)).returning();

  return permission;
}

export async function assignRolesToPermission(id: string, data: AssignRoleToPermissionType) {
  const permissionById = await getPermissionById(id);

  const assignedRoles = await db
    .select({
      rolesUuid: schema.RolesPermissionsSchema.roleUuid,
    })
    .from(schema.RolesPermissionsSchema)
    .where(eq(schema.RolesPermissionsSchema.permissionUuid, permissionById.uuid));

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

  const insertableRoles = newRoleUuids.map((role): typeof schema.RolesPermissionsSchema.$inferInsert => ({
    roleUuid: role,
    permissionUuid: permissionById.uuid,
    uuid: uuid.v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const insertedRolePermissionUuids: (typeof schema.RolesPermissionsSchema.$inferSelect)[] = [];

  if (insertableRoles.length > 0) {
    insertedRolePermissionUuids.push(...(await db.insert(schema.RolesPermissionsSchema).values(insertableRoles).returning()));
  }

  const removedRolePermissionUuids = await db
    .delete(schema.RolesPermissionsSchema)
    .where(sql`${schema.RolesPermissionsSchema.roleUuid} in ${removedRoleUuids}`)
    .returning();

  return {
    removeUuid: removedRolePermissionUuids.map((x) => x.roleUuid).filter(Boolean) as string[],
    insertedUuid: insertedRolePermissionUuids.map((x) => x.roleUuid).filter(Boolean) as string[],
  };
}
