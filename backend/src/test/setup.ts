import SQLite, { type Database } from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../schema/drizzle-schema";
import { validate } from "../utils/helper/validate";
import { validateEnv } from "../service/env.service";

export let db: BetterSQLite3Database<typeof schema>;
let inMemSqLite: Database;

beforeAll(() => {
  // setup env variables
  process.env["AUTHS_DB_URI"] = ":memory:";
  process.env["AUTHS_SECRET"] = "secret_key";
  validateEnv();
});

beforeEach(() => {
  // create in memory sql instance
  let inMemSqLite = new SQLite(":memory:");
  db = drizzle(inMemSqLite, { schema: schema });
  migrate(db, { migrationsFolder: "drizzle" });
});

// close in memory sqlite
afterEach(() => {
  if (inMemSqLite) {
    inMemSqLite.close();
  }
});
