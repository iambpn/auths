import dotEnv from "dotenv";
import * as path from "path";

dotEnv.config({ path: path.resolve(__dirname, "../../.env") });

export const TEST_DB_CONFIG = {
  betterSqlite: {
    uri: ":memory:", // in-memory database
  },
  mySql2: {
    host: process.env.mysql_host,
    port: process.env.mysql_port,
    username: process.env.mysql_user,
    password: process.env.mysql_password,
    dbName: process.env.mysql_test_db,
  },
  nodePostgres: {
    host: process.env.pg_host,
    port: process.env.pg_port,
    username: process.env.pg_user,
    password: process.env.pg_password,
    dbName: process.env.pg_test_db,
  },
} as const;
