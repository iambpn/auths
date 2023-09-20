import * as fs from "fs";
import * as path from "path";
import { db } from "../schema/drizzle-migrate";
import { PermissionSchema } from "../schema/drizzle-schema";
import { permissionValidationSchema } from "../utils/validation_schema/permission.validation.schema";
import * as UUID from "uuid";

export function seedPermission(filePath?: string) {
  if (!filePath) {
    return;
  }

  const fileExt = path.extname(filePath);
  if (fileExt !== "json" && fileExt !== "JSON") {
    throw Error("Invalid Permission file extension. File  must be of type JSON.");
  }

  fs.readFile(filePath, "utf8", async (err, data) => {
    if (err) {
      throw err;
    }

    try {
      const jsonData = JSON.parse(data);

      const validatedJson = permissionValidationSchema.parse(jsonData);

      const insertablePremission = validatedJson.permission.map((data) => ({
        ...data,
        uuid: UUID.v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // seed permission to db
      await db.insert(PermissionSchema).values(insertablePremission);
    } catch (error: unknown) {
      throw error;
    }
  });
}
