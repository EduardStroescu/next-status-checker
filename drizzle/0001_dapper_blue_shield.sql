CREATE TABLE `__new_statusChecker_history_table` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`projectId` bigint unsigned NOT NULL,
	`status` text NOT NULL,
	`lastChecked` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `statusChecker_history_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_statusChecker_history_table`(`id`, `projectId`, `status`, `lastChecked`) SELECT `id`, `projectId`, `status`, `lastChecked` FROM `statusChecker_history_table`;--> statement-breakpoint
DROP TABLE `statusChecker_history_table`;--> statement-breakpoint
ALTER TABLE `__new_statusChecker_history_table` RENAME TO `statusChecker_history_table`;--> statement-breakpoint
CREATE INDEX `project_idx` ON `statusChecker_history_table` (`projectId`);