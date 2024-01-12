CREATE TABLE IF NOT EXISTS "forgot_password" (
	"uuid" varchar PRIMARY KEY NOT NULL,
	"user_uuid" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" date NOT NULL,
	"created_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "login_token" (
	"uuid" varchar PRIMARY KEY NOT NULL,
	"user_uuid" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" date NOT NULL,
	"created_at" date NOT NULL,
	"updated_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"uuid" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"created_at" date NOT NULL,
	"updated_at" date NOT NULL,
	CONSTRAINT "permissions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "__permissionSeed" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" varchar NOT NULL,
	"created_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resetPasswordToken" (
	"uuid" varchar PRIMARY KEY NOT NULL,
	"user_uuid" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" date NOT NULL,
	"created_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rolesPermissions" (
	"uuid" varchar PRIMARY KEY NOT NULL,
	"role_uuid" varchar,
	"permission_uuid" varchar,
	"created_at" date NOT NULL,
	"updated_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"uuid" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"created_at" date NOT NULL,
	"updated_at" date NOT NULL,
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "securityQuestion" (
	"uuid" varchar PRIMARY KEY NOT NULL,
	"user_uuid" varchar NOT NULL,
	"question1" integer NOT NULL,
	"answer1" varchar NOT NULL,
	"question2" integer NOT NULL,
	"answer2" varchar NOT NULL,
	"created_at" date NOT NULL,
	"updated_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"uuid" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"others" text,
	"role_uuid" varchar NOT NULL,
	"is_recoverable" boolean DEFAULT false,
	"created_at" date NOT NULL,
	"updated_at" date NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forgot_password" ADD CONSTRAINT "forgot_password_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "login_token" ADD CONSTRAINT "login_token_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resetPasswordToken" ADD CONSTRAINT "resetPasswordToken_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rolesPermissions" ADD CONSTRAINT "rolesPermissions_role_uuid_roles_uuid_fk" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rolesPermissions" ADD CONSTRAINT "rolesPermissions_permission_uuid_permissions_uuid_fk" FOREIGN KEY ("permission_uuid") REFERENCES "permissions"("uuid") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "securityQuestion" ADD CONSTRAINT "securityQuestion_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
