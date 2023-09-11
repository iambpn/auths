CREATE TABLE `forgot_password` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_uuid` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_uuid`) REFERENCES `user`(`uuid`) ON UPDATE no action ON DELETE no action
);
