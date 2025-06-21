CREATE TABLE `__new_statusChecker_projects_table` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`ownerId` bigint unsigned NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`url` text NOT NULL,
	`healthCheckUrl` text,
	`dbURL` text,
	`dbKey` text,
	`category` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	CONSTRAINT `statusChecker_projects_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_statusChecker_projects_table`(`id`, `ownerId`, `name`, `image`, `url`, `healthCheckUrl`, `dbURL`, `dbKey`, `category`, `enabled`) SELECT `id`, `ownerId`, `name`, `image`, `url`, `healthCheckUrl`, `dbURL`, `dbKey`, `category`, `enabled` FROM `statusChecker_projects_table`;--> statement-breakpoint
DROP TABLE `statusChecker_projects_table`;--> statement-breakpoint
ALTER TABLE `__new_statusChecker_projects_table` RENAME TO `statusChecker_projects_table`;--> statement-breakpoint
CREATE INDEX `owner_idx` ON `statusChecker_projects_table` (`ownerId`);--> statement-breakpoint
ALTER TABLE `statusChecker_users_table` ADD `email` text;--> statement-breakpoint
ALTER TABLE `statusChecker_users_table` ADD `avatar` text;