import { createHash } from "crypto";
import { asc, desc, sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as UUID from "uuid";
import { db } from "../dbSchema/drizzle-migrate";
import { schema } from "../dbSchema/drizzle-schema";
import { config } from "../utils/config/app-config";
import { permissionValidationSchema } from "../utils/validation_schema/auths/permission.validation.schema";
import { signUpFn } from "./auth.service";

export async function runSeed(PermissionFilePath?: string) {
  await seedSuperAdminRole();
  await seedSuperAdminUser();
  await seedFilePermission(PermissionFilePath);
}

export async function seedSuperAdminUser() {
  const hashData = "Seeding SuperAdmin User";
  const hash = createHash("sha256").update(hashData).digest("hex");

  const [existingPermission] = await db
    .select()
    .from(schema.PermissionSeedSchema)
    .where(sql`${schema.PermissionSeedSchema.hash} = ${hash}`)
    .limit(1);

  if (existingPermission && existingPermission.hash === hash) {
    return false;
  }

  // insert super admin
  await signUpFn("admin@admin.com", "admin123", config.superAdminSlug);

  await db.insert(schema.PermissionSeedSchema).values({
    hash: hash,
    createdAt: new Date(),
  });

  config.printFormattedLog("Super-admin user seeded successfully.");
}

export async function seedSuperAdminRole() {
  const hashData = "Seeding SuperAdmin Role";
  const hash = createHash("sha256").update(hashData).digest("hex");

  const [existingPermission] = await db
    .select()
    .from(schema.PermissionSeedSchema)
    .where(sql`${schema.PermissionSeedSchema.hash} = ${hash}`)
    .limit(1);

  if (existingPermission && existingPermission.hash === hash) {
    return false;
  }

  await db.insert(schema.RolesSchema).values({
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "SuperAdmin_Admin",
    slug: config.superAdminSlug,
    uuid: UUID.v4(),
  });

  await db.insert(schema.PermissionSeedSchema).values({
    hash: hash,
    createdAt: new Date(),
  });

  config.printFormattedLog("Super-admin role seeded successfully.");
}

export async function seedFilePermission(filePath?: string) {
  if (!filePath) {
    return false;
  }

  const fileExt = path.extname(filePath);
  if (fileExt !== ".json" && fileExt !== ".JSON") {
    throw Error("Invalid Permission file extension. File must be of type JSON.");
  }

  try {
    const data = await readFileAsync(filePath, "utf8");
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

    await seedFilePermissionCallback(null, JSON.stringify(jsonData));

    // update file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
  } catch (err) {
    await seedFilePermissionCallback(err, "");
  }
}

export async function seedFilePermissionCallback(err: unknown, data: string) {
  if (err) {
    throw err;
  }

  try {
    const hash = createHash("sha256").update(data).digest("hex");

    // get last seed permission hash
    const [existingPermission] = await db.select().from(schema.PermissionSeedSchema).orderBy(desc(schema.PermissionSeedSchema.createdAt)).limit(1);

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

    const previousPermissions = await db.select().from(schema.PermissionSchema).orderBy(asc(schema.PermissionSchema.updatedAt));

    // delete previous permission
    const deletePermissions = previousPermissions.filter(
      (permission) => !newPermissions.find((newPermission) => permission.slug === newPermission.slug)
    );

    if (deletePermissions.length > 0) {
      await db.delete(schema.PermissionSchema).where(sql`${schema.PermissionSchema.slug} IN ${deletePermissions.map((x) => x.slug)}`);
    }

    // insert permission to db
    const insertPermissions = newPermissions.filter(
      (newPermission) => !previousPermissions.find((permission) => permission.slug === newPermission.slug)
    );

    if (insertPermissions.length > 0) {
      await db.insert(schema.PermissionSchema).values(insertPermissions);
    }

    // update permission
    const updatePermissions = newPermissions.filter((newPermission) =>
      previousPermissions.find((permission) => permission.slug === newPermission.slug)
    );

    updatePermissions.map(async (permission) => {
      const { createdAt, uuid, ...updateData } = permission;
      await db
        .update(schema.PermissionSchema)
        .set(updateData)
        .where(sql`${schema.PermissionSchema.slug} = ${permission.slug}`);
    });

    //  insert into permission seed scheme
    await db.insert(schema.PermissionSeedSchema).values({
      hash: hash,
      createdAt: new Date(),
    });

    config.printFormattedLog("Permission seeded successfully.");
  } catch (error: unknown) {
    throw error;
  }
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
