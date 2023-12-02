import { createHash } from "crypto";
import { desc, sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as UUID from "uuid";
import { db } from "../schema/drizzle-migrate";
import { PermissionSchema, PermissionSeedSchema, RolesPermissionsSchema, RolesSchema } from "../schema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { permissionValidationSchema } from "../utils/validation_schema/auths/permission.validation.schema";
import { signUpFn } from "./auth.service";

export function seedPermission(filePath?: string) {
  if (!filePath) {
    return false;
  }

  const fileExt = path.extname(filePath);
  if (fileExt !== ".json" && fileExt !== ".JSON") {
    throw Error("Invalid Permission file extension. File  must be of type JSON.");
  }

  readFileAsync(filePath, "utf8")
    .then(async (data) => {
      const jsonData = JSON.parse(data);

      if (jsonData.isSeeded) {
        return false;
      }

      /*
      - modify: isSeeded Property to true.
      - because to make PermissionSeedHash Consistent.
      - just because isSeeded is false we do not need to re-run the seeding process.
       */
      jsonData.isSeeded = true;

      await readFileCallback(null, JSON.stringify(jsonData));

      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    })
    .catch(async (err) => {
      await readFileCallback(err, "");
    });
}

function readFileAsync(filename: string, encoding: BufferEncoding) {
  return new Promise((resolve: (value: string) => void, reject: (reason: unknown) => void) => {
    fs.readFile(filename, encoding, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function readFileCallback(err: unknown, data: string) {
  if (err) {
    throw err;
  }

  try {
    const hash = createHash("sha256").update(data).digest("hex");

    const [existingPermission] = await db.select().from(PermissionSeedSchema).orderBy(desc(PermissionSeedSchema.createdAt)).limit(1);

    if (existingPermission && existingPermission.hash === hash) {
      return false;
    }

    const jsonData = JSON.parse(data);

    const validatedJson = permissionValidationSchema.parse(jsonData);

    const newPermissions = validatedJson.permission.map((data) => ({
      ...data,
      uuid: UUID.v4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const previousPermissions = await db.select().from(PermissionSchema);

    // delete previous permission
    const deletePermissions = previousPermissions.filter(
      (permission) => !newPermissions.find((newPermission) => permission.slug === newPermission.slug)
    );

    if (deletePermissions.length > 0) {
      await db.delete(PermissionSchema).where(sql`${PermissionSchema.slug} IN ${deletePermissions.map((x) => x.slug)}`);
    }

    // insert permission to db
    const insertPermissions = newPermissions.filter(
      (newPermission) => !previousPermissions.find((permission) => permission.slug === newPermission.slug)
    );

    if (insertPermissions.length > 0) {
      await db.insert(PermissionSchema).values(insertPermissions);
    }

    // update permission
    const updatePermissions = newPermissions.filter((newPermission) =>
      previousPermissions.find((permission) => permission.slug === newPermission.slug)
    );

    updatePermissions.map(async (permission) => {
      const { createdAt, uuid, ...updateData } = permission;
      await db
        .update(PermissionSchema)
        .set(updateData)
        .where(sql`${PermissionSchema.slug} = ${permission.slug}`);
    });

    //  update permission seed scheme
    await db.insert(PermissionSeedSchema).values({
      hash: hash,
      createdAt: new Date(),
    });

    // insert super admin role
    const [superAdmin] = await db
      .select()
      .from(RolesSchema)
      .where(sql`${RolesSchema.slug} = ${config.superAdminSlug}`);

    if (!superAdmin) {
      await db.insert(RolesSchema).values({
        createdAt: new Date(),
        updatedAt: new Date(),
        name: config.superAdminSlug,
        slug: config.superAdminSlug,
        uuid: UUID.v4(),
      });
    }

    // add all permission to super admin
    if (insertPermissions.length > 0) {
      const insertPermissionSlugs = insertPermissions.map((x) => x.slug);
      const permissions = await db
        .select()
        .from(PermissionSchema)
        .where(sql`${PermissionSchema.slug} IN ${insertPermissionSlugs}`);

      const [role] = await db
        .select()
        .from(RolesSchema)
        .where(sql`${RolesSchema.slug} = ${config.superAdminSlug}`);

      await db.insert(RolesPermissionsSchema).values(
        permissions.map((permission) => ({
          permissionUuid: permission.uuid,
          roleUuid: role.uuid,
          uuid: UUID.v4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }

    await signUpFn("admin@admin.com", "admin123", config.superAdminSlug);

    console.log("** [AUTHS] Permission seeded successfully.");
  } catch (error: unknown) {
    throw error;
  }
}
