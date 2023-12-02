import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./drizzle-schema";
import path from "path";

export let db: BetterSQLite3Database<typeof schema>;

/**
 * Instantiate and migrate db
 * @param dbUri Path to db
 */
export function migrateDB(dbUri: string) {
  console.log("\n** Migrating DB using Drizzle Kit.");

  const sqlite = new Database(dbUri);
  sqlite.pragma("foreign_keys = ON");
  db = drizzle(sqlite, { schema: schema });
  migrate(db, { migrationsFolder: path.join(__dirname, "../../drizzle"), migrationsTable: "drizzle_migrations" });

  console.log("** Migration Completed.\n");
}
