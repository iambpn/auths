import { ENV_VARS } from "../service/env.service";
import * as mysqlSchema from "./drizzle-schema.mysql";
import * as postgresSchema from "./drizzle-schema.postgres";
import * as sqliteSchema from "./drizzle-schema.sqlite";

export let schema: typeof sqliteSchema;

/**
 * Initialize Schema according to Driver
 * Forcing return type because of type error when using select query
 */
export function initializeSchema() {
  schema = (
    ENV_VARS.AUTHS_DB_DRIVER === "sqlite" ? sqliteSchema : ENV_VARS.AUTHS_DB_DRIVER === "postgres" ? postgresSchema : mysqlSchema
  ) as typeof sqliteSchema;
}
