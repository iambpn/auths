import SQLite, { type Database } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

let client: Database;

/**
 * Instantiate and migrate better sqlite db
 * @param DbUri
 * @param migration_folder_path
 * @returns
 */
export async function migrateBetterSqLiteConnection(DbUri: string, migration_folder_path: string, logger = false) {
  client = new SQLite(DbUri);
  client.pragma("foreign_keys = ON");
  const db = drizzle(client, { logger: logger });

  migrate(db, { migrationsFolder: migration_folder_path, migrationsTable: "drizzle_migrations" });

  return db;
}

export function closeBetterSqLiteConnection() {
  if (client) {
    client.close();
  }
}
