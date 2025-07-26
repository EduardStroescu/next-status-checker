CREATE TABLE `statusChecker_sessions_table` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`userId` bigint unsigned NOT NULL,
	`refresh_token` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `statusChecker_sessions_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `statusChecker_sessions_table` (`userId`);--> statement-breakpoint
CREATE INDEX `refresh_token_idx` ON `statusChecker_sessions_table` (`refresh_token`);