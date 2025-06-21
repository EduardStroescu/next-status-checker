CREATE TABLE `statusChecker_history_table` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`projectId` bigint unsigned NOT NULL,
	`status` text NOT NULL,
	`last_checked` timestamp NOT NULL,
	CONSTRAINT `statusChecker_history_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `project_idx` ON `statusChecker_history_table` (`projectId`);--> statement-breakpoint
CREATE TABLE `statusChecker_projects_table` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`ownerId` bigint unsigned NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`dbURL` text,
	`dbKey` text,
	`category` text NOT NULL,
	CONSTRAINT `statusChecker_projects_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `owner_idx` ON `statusChecker_projects_table` (`ownerId`);--> statement-breakpoint
CREATE TABLE `statusChecker_users_table` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `statusChecker_users_table_id` PRIMARY KEY(`id`)
);
