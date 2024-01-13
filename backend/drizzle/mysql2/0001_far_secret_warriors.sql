ALTER TABLE `forgot_password` MODIFY COLUMN `expires_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `forgot_password` MODIFY COLUMN `created_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `login_token` MODIFY COLUMN `expires_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `login_token` MODIFY COLUMN `created_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `login_token` MODIFY COLUMN `updated_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `permissions` MODIFY COLUMN `created_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `permissions` MODIFY COLUMN `updated_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `__permissionSeed` MODIFY COLUMN `created_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `resetPasswordToken` MODIFY COLUMN `expires_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `resetPasswordToken` MODIFY COLUMN `created_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `rolesPermissions` MODIFY COLUMN `created_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `rolesPermissions` MODIFY COLUMN `updated_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `roles` MODIFY COLUMN `created_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `roles` MODIFY COLUMN `updated_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `securityQuestion` MODIFY COLUMN `created_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `securityQuestion` MODIFY COLUMN `updated_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `created_at` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `updated_at` timestamp(3) NOT NULL;