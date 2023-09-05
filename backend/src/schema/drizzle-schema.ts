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

export const LoginTokenSchema = sqliteTable("login_token", {
  uuid: text("uuid").primaryKey().notNull(),
  userUuid: text("user_uuid")
    .notNull()
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  token: text("token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export type LoginTokenTable = Kyselify<typeof LoginTokenSchema>;
