CREATE TABLE `forgot_password` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_uuid` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `login_token` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_uuid` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`uuid` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`others` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
