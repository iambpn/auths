import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { Database } from "./kysley-schema";

export let db: Kysely<Database>;

/**
 * Instantiate DB at the start up. DB instance is a singleton.
 */
export function instantiateDB(dbUri?: string) {
  if (db) {
    return db;
  }

  if (!dbUri) {
    throw new Error("Env variable AUTHS_DB_URI must be defined to initialize Auths DB");
  }

  const dialect = new SqliteDialect({
    database: new SQLite(dbUri),
  });

  db = new Kysely<Database>({
    dialect,
  });

  return db;
}
