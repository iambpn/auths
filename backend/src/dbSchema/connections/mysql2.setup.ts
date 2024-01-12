import { drizzle } from "drizzle-orm/mysql2";
import mysql, { Connection } from "mysql2/promise";
import { migrate } from "drizzle-orm/mysql2/migrator";

let client: Connection;
const migration_table = "drizzle_migrations";

/**
 * Instantiate and migrate better Mysql db
 * @param config
 * @param migration_folder_path
 * @returns
 */
export async function migrateMysql2Connection(
  config: { host: string; port: number; user: string; password: string; dbName: string },
  migration_folder_path: string,
  logger = false
) {
  client = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.dbName,
  });

  await client.connect();
  const db = drizzle(client, { logger: logger });

  await migrate(db, { migrationsFolder: migration_folder_path, migrationsTable: migration_table });

  return db;
}

export async function closeMysql2Connection(truncateTable: Boolean = false, truncateDb: string) {
  if (client) {
    if (truncateTable) {
      const results = await client.query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE table_schema IN ('${truncateDb}') and TABLE_NAME NOT IN ('${migration_table}');`
      );

      await Promise.all(
        (results[0] as any[]).map(async (row) => {
          await client.query(`DELETE FROM ${row.TABLE_NAME} WHERE 1;`);
          await client.query(`ALTER TABLE ${row.TABLE_NAME} AUTO_INCREMENT = 1;`);
        })
      );
    }
    await client.end();
  }
}
