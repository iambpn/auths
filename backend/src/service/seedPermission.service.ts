import * as fs from "fs";
import * as path from "path";

export function seedPermission(filePath?: string) {
  if (!filePath) {
    return;
  }

  const fileExt = path.extname(filePath);
  if (fileExt !== "json" && fileExt !== "JSON") {
    throw Error("Invalid Permission file extension. File  must be of type JSON.");
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      throw err;
    }

    try {
      const jsonData: { permission: string[] } = JSON.parse(data);

      if (!jsonData.permission) {
        throw new Error("Invalid JSON schema. Json schema must be of type `{ permission: string[] }`");
      }

      // seed permission to db;
    } catch (error) {
      throw error;
    }
  });
}
