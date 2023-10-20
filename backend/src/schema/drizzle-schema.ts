import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const UserSchema = sqliteTable("user", {
  uuid: text("uuid").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  others: text("others"),
  role: text("role_uuid").notNull(),
  isRecoverable: integer("is_recoverable", { mode: "boolean" }).default(false),
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

export const RolesSchema = sqliteTable("roles", {
  uuid: text("uuid").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const PermissionSchema = sqliteTable("permissions", {
  uuid: text("uuid").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const RolesPermissionsSchema = sqliteTable("rolesPermissions", {
  uuid: text("uuid").primaryKey(),
  roleUuid: text("role_uuid").references(() => RolesSchema.uuid, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  permissionUuid: text("permission_uuid").references(() => PermissionSchema.uuid, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const PermissionSeedSchema = sqliteTable("__permissionSeed", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  hash: text("hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const SecurityQuestionSchema = sqliteTable("securityQuestion", {
  uuid: text("uuid").primaryKey(),
  userUuid: text("user_uuid").references(() => UserSchema.uuid, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  question1: integer("question1").notNull(),
  answer1: text("answer1").notNull(),
  question2: integer("question2").notNull(),
  answer2: text("answer2").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const ResetPasswordToken = sqliteTable("resetPasswordToken", {
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
