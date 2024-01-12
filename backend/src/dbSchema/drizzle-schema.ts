import { ENV_VARS } from "../service/env.service";
import { mysqlDBSchema } from "./schema/drizzle-schema.mysql";
import { postgresDBSchema } from "./schema/drizzle-schema.postgres";
import { sqLiteDBSchema } from "./schema/drizzle-schema.sqlite";

export let schema: typeof sqLiteDBSchema;

/**
 * Initialize Schema according to Driver
 * Forcing return type because of type error when using select query
 */
export function initializeSchema() {
  schema = (
    ENV_VARS.AUTHS_DB_DRIVER === "better-sqlite" ? sqLiteDBSchema : ENV_VARS.AUTHS_DB_DRIVER === "node-postgres" ? postgresDBSchema : mysqlDBSchema
  ) as typeof sqLiteDBSchema;
}
