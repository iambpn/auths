const path = require("path");

/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./src/schema/drizzle-schema.ts",
  driver: "better-sqlite",
  dbCredentials: {
    url: process.env.AUTHS_DB_PATH,
  },
  out: "./drizzle",
};
