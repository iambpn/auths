import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { ArrayToIntersection, Auths_DB_Driver } from "../_app.type";
import { closeDBConnection, migrateDB } from "../dbSchema/drizzle-migrate";
import { initializeSchema } from "../dbSchema/drizzle-schema";
import { ENV_VARS, validateEnv } from "../service/env.service";
import { TEST_DB_CONFIG } from "./dbConfig";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export let db: NodePgDatabase;

declare global {
  namespace NodeJS {
    interface ProcessEnv
      extends Partial<{
        TEST_DB_DRIVER: ArrayToIntersection<Auths_DB_Driver>;
      }> {}
  }
}

beforeAll(() => {
  const driver = process.env.TEST_DB_DRIVER;

  // setup env variables
  process.env["AUTHS_SECRET"] = "secret_key";
  process.env["AUTHS_DB_DRIVER"] = driver;

  if (driver === "better-sqlite") {
    process.env["AUTHS_DB_URI"] = TEST_DB_CONFIG.betterSqlite.uri;
  } else if (driver === "node-postgres") {
    process.env["AUTHS_DB_HOST"] = TEST_DB_CONFIG.nodePostgres.host;
    process.env["AUTHS_DB_PORT"] = TEST_DB_CONFIG.nodePostgres.port;
    process.env["AUTHS_DB_PASSWORD"] = TEST_DB_CONFIG.nodePostgres.password;
    process.env["AUTHS_DB_USERNAME"] = TEST_DB_CONFIG.nodePostgres.username;
    process.env["AUTHS_DB_NAME"] = TEST_DB_CONFIG.nodePostgres.dbName;
  } else {
    process.env["AUTHS_DB_HOST"] = TEST_DB_CONFIG.mySql2.host;
    process.env["AUTHS_DB_PORT"] = TEST_DB_CONFIG.mySql2.port;
    process.env["AUTHS_DB_PASSWORD"] = TEST_DB_CONFIG.mySql2.password;
    process.env["AUTHS_DB_USERNAME"] = TEST_DB_CONFIG.mySql2.username;
    process.env["AUTHS_DB_NAME"] = TEST_DB_CONFIG.mySql2.dbName;
  }

  process.env["TZ"] = "Etc/UTC";
  validateEnv();
  initializeSchema();
});

beforeEach(async () => {
  db = await migrateDB(ENV_VARS.AUTHS_DB_DRIVER, `drizzle/${ENV_VARS.AUTHS_DB_DRIVER}`, false);
});

afterEach(async () => {
  await closeDBConnection(ENV_VARS.AUTHS_DB_DRIVER, true);
});
