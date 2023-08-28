import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Kyselify } from "drizzle-orm/kysely";
import { sql } from "drizzle-orm";

export const UserSchema = sqliteTable("user", {
  uuid: text("uuid").primaryKey().notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  others: blob("others", { mode: "json" }).$type<Record<string, any>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export type UserTable = Kyselify<typeof UserSchema>;
