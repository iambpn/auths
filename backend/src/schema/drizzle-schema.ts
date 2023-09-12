import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const UserSchema = sqliteTable("user", {
  uuid: text("uuid").primaryKey().notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  others: text("others"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const LoginTokenSchema = sqliteTable("login_token", {
  uuid: text("uuid").primaryKey().notNull(),
  userUuid: text("user_uuid")
    .notNull()
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  token: text("token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const ForgotPasswordSchema = sqliteTable("forgot_password", {
  uuid: text("uuid").primaryKey().notNull(),
  userUuid: text("user_uuid")
    .notNull()
    .references(() => UserSchema.uuid, {
      onDelete: "no action",
      onUpdate: "no action",
    }),
  token: text("token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});
