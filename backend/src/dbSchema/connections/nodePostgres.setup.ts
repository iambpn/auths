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

  await migrate(db, { migrationsFolder: migration_folder_path, migrationsTable: "drizzle_migrations" });

  return db;
}

export async function closeNodePostgresConnection(truncateTable: Boolean = false) {
  if (client) {
    await client.end();

    if (truncateTable) {
      const query = await client.query(
        `SELECT 'TRUNCATE ' || input_table_name || ' CASCADE;' AS truncate_query FROM(SELECT table_schema || '.' || table_name AS input_table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') AND table_schema NOT LIKE 'pg_toast%') AS information;`
      );
      await Promise.all(
        query.rows.map(async (row) => {
          await client.query(row.truncate_query);
        })
      );
    }
  }
}
