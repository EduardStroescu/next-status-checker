CREATE TABLE `__new_statusChecker_users_table` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`avatar` text,
	`password` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `statusChecker_users_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_statusChecker_users_table`(`id`, `username`, `email`, `avatar`, `password`, `createdAt`) SELECT `id`, `username`, `email`, `avatar`, `password`, `createdAt` FROM `statusChecker_users_table`;--> statement-breakpoint
DROP TABLE `statusChecker_users_table`;--> statement-breakpoint
ALTER TABLE `__new_statusChecker_users_table` RENAME TO `statusChecker_users_table`;--> statement-breakpoint
CREATE INDEX `email_idx` ON `statusChecker_users_table` (`email`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `statusChecker_users_table` (`username`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `statusChecker_history_table` (`status`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `statusChecker_projects_table` (`name`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `statusChecker_projects_table` (`category`);--> statement-breakpoint
CREATE INDEX `enabled_idx` ON `statusChecker_projects_table` (`enabled`);