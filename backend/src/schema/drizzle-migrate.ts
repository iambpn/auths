import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export function migrateDB(dbPath?: string) {
  console.log("\n** Migrating DB using Drizzle Kit.");

  if (!dbPath) {
    throw new Error("Env variable AUTHS_DB_PATH must be defined to initialize Auths DB");
  }

  const sqlite = new Database(dbPath);
  const drzldb = drizzle(sqlite);
  migrate(drzldb, { migrationsFolder: "drizzle" });

  console.log("** Migration Completed.\n");
}
