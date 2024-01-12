import { drizzle } from "drizzle-orm/mysql2";
import mysql, { Connection } from "mysql2/promise";
import { migrate } from "drizzle-orm/mysql2/migrator";

let client: Connection;

/**
 * Instantiate and migrate better Mysql db
 * @param config
 * @param migration_folder_path
 * @returns
 */
export async function migrateMysql2Connection(
  config: { host: string; port: number; user: string; password: string; dbName: string },
  migration_folder_path: string
) {
  client = await mysql.createConnection({
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

export async function closeMysql2Connection(truncateTable: Boolean = false) {
  if (client) {
    await client.end();
  }
}
