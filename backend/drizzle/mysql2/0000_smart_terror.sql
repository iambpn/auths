CREATE TABLE `forgot_password` (
	`uuid` varchar(256) NOT NULL,
	`user_uuid` varchar(256) NOT NULL,
	`token` varchar(256) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `forgot_password_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `login_token` (
	`uuid` varchar(256) NOT NULL,
	`user_uuid` varchar(256) NOT NULL,
	`token` varchar(256) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `login_token_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`uuid` varchar(256) NOT NULL,
	`name` varchar(256) NOT NULL,
	`slug` varchar(256) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `permissions_uuid` PRIMARY KEY(`uuid`),
	CONSTRAINT `permissions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `__permissionSeed` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`hash` varchar(256) NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `__permissionSeed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resetPasswordToken` (
	`uuid` varchar(256) NOT NULL,
	`user_uuid` varchar(256) NOT NULL,
	`token` varchar(256) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `resetPasswordToken_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `rolesPermissions` (
	`uuid` varchar(256) NOT NULL,
	`role_uuid` varchar(256),
	`permission_uuid` varchar(256),
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `rolesPermissions_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`uuid` varchar(256) NOT NULL,
	`name` varchar(256) NOT NULL,
	`slug` varchar(256) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `roles_uuid` PRIMARY KEY(`uuid`),
	CONSTRAINT `roles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `securityQuestion` (
	`uuid` varchar(256) NOT NULL,
	`user_uuid` varchar(256) NOT NULL,
	`question1` int NOT NULL,
	`answer1` varchar(256) NOT NULL,
	`question2` int NOT NULL,
	`answer2` varchar(256) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `securityQuestion_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`uuid` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`password` varchar(256) NOT NULL,
	`others` text,
	`role_uuid` varchar(256) NOT NULL,
	`is_recoverable` boolean DEFAULT false,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `user_uuid` PRIMARY KEY(`uuid`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `forgot_password` ADD CONSTRAINT `forgot_password_user_uuid_user_uuid_fk` FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `login_token` ADD CONSTRAINT `login_token_user_uuid_user_uuid_fk` FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `resetPasswordToken` ADD CONSTRAINT `resetPasswordToken_user_uuid_user_uuid_fk` FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `rolesPermissions` ADD CONSTRAINT `rolesPermissions_role_uuid_roles_uuid_fk` FOREIGN KEY (`role_uuid`) REFERENCES `roles`(`uuid`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `rolesPermissions` ADD CONSTRAINT `rolesPermissions_permission_uuid_permissions_uuid_fk` FOREIGN KEY (`permission_uuid`) REFERENCES `permissions`(`uuid`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `securityQuestion` ADD CONSTRAINT `securityQuestion_user_uuid_user_uuid_fk` FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON DELETE cascade ON UPDATE cascade;