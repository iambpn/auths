import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";

let client: Client;

/**
 * Instantiate and migrate better postgres db
 * @param config
 * @param migration_folder_path
 * @returns
 */
export async function migrateNodePostgresConnection(
  config: { host: string; port: number; user: string; password: string; dbName: string },
  migration_folder_path: string
) {
  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.dbName,
  });

  await client.connect();
  const db = drizzle(client);

  migrate(db, { migrationsFolder: migration_folder_path, migrationsTable: "drizzle_migrations" });

  return db;
}

export async function closeNodePostgresConnection() {
  if (client) {
    await client.end();
  }
}
