CREATE TABLE `permissions` (
	`uuid` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `__permissionSeed` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rolesPermissions` (
	`uuid` text PRIMARY KEY NOT NULL,
	`role_uuid` text,
	`permission_uuid` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`role_uuid`) REFERENCES `roles`(`uuid`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`permission_uuid`) REFERENCES `permissions`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`uuid` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE user ADD `role` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_slug_unique` ON `permissions` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `roles_slug_unique` ON `roles` (`slug`);