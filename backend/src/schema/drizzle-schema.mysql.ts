import { boolean, date, int, mysqlTable, serial, text, varchar } from "drizzle-orm/mysql-core";

export const UserSchema = mysqlTable("user", {
  uuid: varchar("uuid", { length: 256 }).primaryKey(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  password: varchar("password", { length: 256 }).notNull(),
  others: text("others"),
  role: varchar("role_uuid", { length: 256 }).notNull(),
  isRecoverable: boolean("is_recoverable").default(false),
  createdAt: date("created_at").notNull(),
  updatedAt: date("updated_at").notNull(),
});

export const LoginTokenSchema = mysqlTable("login_token", {
  uuid: varchar("uuid", { length: 256 }).primaryKey(),
  userUuid: varchar("user_uuid", { length: 256 })
    .notNull()
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  token: varchar("token", { length: 256 }).notNull(),
  expiresAt: date("expires_at").notNull(),
  createdAt: date("created_at").notNull(),
  updatedAt: date("updated_at").notNull(),
});

export const ForgotPasswordSchema = mysqlTable("forgot_password", {
  uuid: varchar("uuid", { length: 256 }).primaryKey(),
  userUuid: varchar("user_uuid", { length: 256 })
    .notNull()
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  token: varchar("token", { length: 256 }).notNull(),
  expiresAt: date("expires_at").notNull(),
  createdAt: date("created_at").notNull(),
});

export const RolesSchema = mysqlTable("roles", {
  uuid: varchar("uuid", { length: 256 }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).unique().notNull(),
  createdAt: date("created_at").notNull(),
  updatedAt: date("updated_at").notNull(),
});

export const PermissionSchema = mysqlTable("permissions", {
  uuid: varchar("uuid", { length: 256 }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).unique().notNull(),
  createdAt: date("created_at").notNull(),
  updatedAt: date("updated_at").notNull(),
});

export const RolesPermissionsSchema = mysqlTable("rolesPermissions", {
  uuid: varchar("uuid", { length: 256 }).primaryKey(),
  roleUuid: varchar("role_uuid", { length: 256 }).references(() => RolesSchema.uuid, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  permissionUuid: varchar("permission_uuid", { length: 256 }).references(() => PermissionSchema.uuid, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: date("created_at").notNull(),
  updatedAt: date("updated_at").notNull(),
});

export const PermissionSeedSchema = mysqlTable("__permissionSeed", {
  id: serial("id").primaryKey(),
  hash: varchar("hash", { length: 256 }).notNull(),
  createdAt: date("created_at").notNull(),
});

export const SecurityQuestionSchema = mysqlTable("securityQuestion", {
  uuid: varchar("uuid", { length: 256 }).primaryKey(),
  userUuid: varchar("user_uuid", { length: 256 })
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  question1: int("question1").notNull(),
  answer1: varchar("answer1", { length: 256 }).notNull(),
  question2: int("question2").notNull(),
  answer2: varchar("answer2", { length: 256 }).notNull(),
  createdAt: date("created_at").notNull(),
  updatedAt: date("updated_at").notNull(),
});

export const ResetPasswordTokenSchema = mysqlTable("resetPasswordToken", {
  uuid: varchar("uuid", { length: 256 }).primaryKey(),
  userUuid: varchar("user_uuid", { length: 256 })
    .notNull()
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  token: varchar("token", { length: 256 }).notNull(),
  expiresAt: date("expires_at").notNull(),
  createdAt: date("created_at").notNull(),
});
