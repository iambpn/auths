const path = require("path");
const dotEnv = require("dotenv");

dotEnv.config({ path: path.resolve(__dirname, ".env") });

/** @type { import("drizzle-kit").Config } */
const config = {};

if (process.env.AUTHS_DB_DRIVER === "better-sqlite") {
  /** @type { import("drizzle-kit").Config } */
  const localConfig = {
    schema: "./src/dbSchema/schema/drizzle-schema.sqlite.ts",
    driver: "better-sqlite",
    dbCredentials: {
      url: process.env.sqlite_uri,
    },
    out: `./drizzle/${process.env.AUTHS_DB_DRIVER}`,
  };

  Object.assign(config, localConfig);
} else if (process.env.AUTHS_DB_DRIVER === "node-postgres") {
  /** @type { import("drizzle-kit").Config } */
  const localConfig = {
    schema: "./src/dbSchema/schema/drizzle-schema.postgres.ts",
    driver: "pg",
    dbCredentials: {
      host: process.env.pg_host,
      port: process.env.pg_port,
      user: process.env.pg_user,
      password: process.env.pg_password,
      database: process.env.pg_db,
    },
    out: `./drizzle/${process.env.AUTHS_DB_DRIVER}`,
  };

  Object.assign(config, localConfig);
} else if (process.env.AUTHS_DB_DRIVER === "mysql2") {
  /** @type { import("drizzle-kit").Config } */
  const localConfig = {
    schema: "./src/dbSchema/schema/drizzle-schema.mysql.ts",
    driver: "mysql2",
    dbCredentials: {
      host: process.env.mysql_host,
      port: process.env.mysql_port,
      user: process.env.mysql_user,
      password: process.env.mysql_password,
      database: process.env.mysql_db,
    },
    out: `./drizzle/${process.env.AUTHS_DB_DRIVER}`,
  };

  Object.assign(config, localConfig);
}

console.log(config);

export default config;
