import { boolean, integer, pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const UserSchema = pgTable("user", {
  uuid: varchar("uuid").primaryKey(),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  others: text("others"),
  role: varchar("role_uuid").notNull(),
  isRecoverable: boolean("is_recoverable").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const LoginTokenSchema = pgTable("login_token", {
  uuid: varchar("uuid").primaryKey(),
  userUuid: varchar("user_uuid")
    .notNull()
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const ForgotPasswordSchema = pgTable("forgot_password", {
  uuid: varchar("uuid").primaryKey(),
  userUuid: varchar("user_uuid")
    .notNull()
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const RolesSchema = pgTable("roles", {
  uuid: varchar("uuid").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const PermissionSchema = pgTable("permissions", {
  uuid: varchar("uuid").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const RolesPermissionsSchema = pgTable("rolesPermissions", {
  uuid: varchar("uuid").primaryKey(),
  roleUuid: varchar("role_uuid").references(() => RolesSchema.uuid, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  permissionUuid: varchar("permission_uuid").references(() => PermissionSchema.uuid, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const PermissionSeedSchema = pgTable("__permissionSeed", {
  id: serial("id").primaryKey(),
  hash: varchar("hash").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const SecurityQuestionSchema = pgTable("securityQuestion", {
  uuid: varchar("uuid").primaryKey(),
  userUuid: varchar("user_uuid")
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  question1: integer("question1").notNull(),
  answer1: varchar("answer1").notNull(),
  question2: integer("question2").notNull(),
  answer2: varchar("answer2").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const ResetPasswordTokenSchema = pgTable("resetPasswordToken", {
  uuid: varchar("uuid").primaryKey(),
  userUuid: varchar("user_uuid")
    .notNull()
    .references(() => UserSchema.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const postgresDBSchema = {
  UserSchema,
  LoginTokenSchema,
  ForgotPasswordSchema,
  RolesSchema,
  PermissionSchema,
  RolesPermissionsSchema,
  PermissionSeedSchema,
  SecurityQuestionSchema,
  ResetPasswordTokenSchema,
};
