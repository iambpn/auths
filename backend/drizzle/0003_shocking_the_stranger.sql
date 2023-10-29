CREATE TABLE `resetPasswordToken` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_uuid` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `securityQuestion` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_uuid` text NOT NULL,
	`question1` integer NOT NULL,
	`answer1` text NOT NULL,
	`question2` integer NOT NULL,
	`answer2` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN `role` TO `role_uuid`;--> statement-breakpoint
ALTER TABLE user ADD `is_recoverable` integer DEFAULT false;