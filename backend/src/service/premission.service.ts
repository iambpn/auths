import { eq } from "drizzle-orm";
import { db } from "../schema/drizzle-migrate";
import { PermissionSchema, RolesPermissionsSchema, RolesSchema } from "../schema/drizzle-schema";
import { PaginationQuery } from "../utils/helper/parsePagination";
import { CreatePermissionType } from "../utils/validation_schema/cms/createPermission.validation.schema";
import * as uuid from "uuid";
import { HttpError } from "../utils/helper/httpError";

export async function getAllPermission(paginationQuery: ReturnType<typeof PaginationQuery>) {
  const permissions = await db.select().from(PermissionSchema).limit(paginationQuery.limit).offset(paginationQuery.skip);
  return permissions;
}

export async function getPermissionById(id: string) {
  const [permission] = await db.select().from(PermissionSchema).where(eq(PermissionSchema.uuid, id)).limit(1);

  if (!permission) {
    throw new HttpError("Permission not found.", 404);
  }

  return permission;
}

export async function createPermission(permissionData: CreatePermissionType) {
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
