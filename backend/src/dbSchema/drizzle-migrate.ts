import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { ArrayToIntersection, Auths_DB_Driver } from "../_app.type";
import { ENV_VARS } from "../service/env.service";
import { closeBetterSqLiteConnection, migrateBetterSqLiteConnection } from "./connections/betterSqlite.setup";
import { closeMysql2Connection, migrateMysql2Connection } from "./connections/mysql2.setup";
import { closeNodePostgresConnection, migrateNodePostgresConnection } from "./connections/nodePostgres.setup";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

// Forcing DB instance to be Sqlite because of ts lint issue
export let db: NodePgDatabase;

/**
 * Instantiate and migrate db
 * @param driver
 * @param migration_folder_path
 * @returns db instance
 */
export async function migrateDB(driver: ArrayToIntersection<Auths_DB_Driver>, migration_folder_path: string, logger = false) {
  console.log("\n** Migrating DB using Drizzle Kit.");

  const dbConfig = {
    host: ENV_VARS.AUTHS_DB_HOST!,
    port: ENV_VARS.AUTHS_DB_PORT!,
    password: ENV_VARS.AUTHS_DB_PASSWORD!,
    user: ENV_VARS.AUTHS_DB_USERNAME!,
    dbName: ENV_VARS.AUTHS_DB_NAME!,
  };

  if (driver === "better-sqlite") {
    const betterSqliteDb = await migrateBetterSqLiteConnection(ENV_VARS.AUTHS_DB_URI!, migration_folder_path, logger);
    db = betterSqliteDb as unknown as typeof db;
  } else if (driver === "node-postgres") {
    const nodePostgresDb = await migrateNodePostgresConnection(dbConfig, migration_folder_path, logger);
    db = nodePostgresDb as unknown as typeof db;
  } else {
    const mySql2Db = await migrateMysql2Connection(dbConfig, migration_folder_path, logger);
    db = mySql2Db as unknown as typeof db;
  }

  console.log("** Migration Completed.");
  console.log("** DB Connection Initialized.\n");

  return db;
}

export async function closeDBConnection(driver: ArrayToIntersection<Auths_DB_Driver>, truncateTable: boolean = false) {
  if (driver === "better-sqlite") {
    closeBetterSqLiteConnection();
  } else if (driver === "node-postgres") {
    await closeNodePostgresConnection(truncateTable);
  } else if (driver === "mysql2") {
    await closeMysql2Connection(truncateTable);
  }
}
