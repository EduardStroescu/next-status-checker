ALTER TABLE `statusChecker_sessions_table` CHANGE `refresh_token` `refreshToken`;--> statement-breakpoint
DROP INDEX `refresh_token_idx` ON `statusChecker_sessions_table`;--> statement-breakpoint
CREATE INDEX `refresh_token_idx` ON `statusChecker_sessions_table` (`refreshToken`);