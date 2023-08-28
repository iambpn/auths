import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { Database } from "./kysley-schema";

const dialect = new SqliteDialect({
  database: new SQLite(process.env.AUTHS_DB_PATH!),
});

export const db = new Kysely<Database>({
  dialect,
});
