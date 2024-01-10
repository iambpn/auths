/* Migrating Table to Update Foreign Key */
CREATE TABLE `new_table` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_uuid` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `new_table` SELECT * FROM `resetPasswordToken`;
--> statement-breakpoint
ALTER TABLE `resetPasswordToken` RENAME TO `temp_table`;
--> statement-breakpoint
ALTER TABLE `new_table` RENAME TO `resetPasswordToken`;
--> statement-breakpoint
DROP TABLE `temp_table`;
--> statement-breakpoint

/* Migrating Table to Update Foreign Key  */
CREATE TABLE `new_table` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_uuid` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `new_table` SELECT * FROM `forgot_password`;
--> statement-breakpoint
ALTER TABLE `forgot_password` RENAME TO `temp_table`;
--> statement-breakpoint
ALTER TABLE `new_table` RENAME TO `forgot_password`;
--> statement-breakpoint
DROP TABLE `temp_table`;