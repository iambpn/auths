import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const UserSchema = sqliteTable("user", {
  uuid: text("uuid").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  others: text("others"),
  role: text("role").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const LoginTokenSchema = sqliteTable("login_token", {
  uuid: text("uuid").primaryKey(),
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
  uuid: text("uuid").primaryKey(),
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

export const Roles = sqliteTable("roles", {
  uuid: text("uuid").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const Permission = sqliteTable("permissions", {
  uuid: text("uuid").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const RolesPermissions = sqliteTable("rolesPermissions", {
  uuid: text("uuid").primaryKey(),
  roleUuid: text("role_uuid").references(() => Roles.uuid, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  permissionUuid: text("permission_uuid").references(() => Permission.uuid, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
