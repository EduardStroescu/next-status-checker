import { singlestoreTable, singlestoreSchema, AnySingleStoreColumn, primaryKey, bigint, text, timestamp, tinyint } from "drizzle-orm/singlestore-core"
import { sql } from "drizzle-orm"

export const statusCheckerHistoryTable = singlestoreTable("statusChecker_history_table", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint({ mode: "number", unsigned: true }).notNull(),
	status: text().notNull(),
	lastChecked: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "statusChecker_history_table_id"}),
]);

export const statusCheckerProjectsTable = singlestoreTable("statusChecker_projects_table", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	ownerId: bigint({ mode: "number", unsigned: true }).notNull(),
	name: text().notNull(),
	image: text(),
	url: text().notNull(),
	healthCheckUrl: text(),
	dbUrl: text(),
	dbKey: text(),
	category: text().notNull(),
	enabled: tinyint().default(1).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "statusChecker_projects_table_id"}),
]);

export const statusCheckerUsersTable = singlestoreTable("statusChecker_users_table", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "statusChecker_users_table_id"}),
]);
