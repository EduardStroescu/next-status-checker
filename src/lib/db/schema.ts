import { relations } from "drizzle-orm";
import {
  text,
  index,
  singlestoreTableCreator,
  bigint,
  timestamp,
  boolean,
} from "drizzle-orm/singlestore-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = singlestoreTableCreator(
  (name) => `statusChecker_${name}`
);

export const users_table = createTable(
  "users_table",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement()
      .notNull(),
    username: text("username").notNull(),
    email: text("email").notNull(),
    avatar: text("avatar"),
    password: text("password").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => [
    index("email_idx").on(table.email),
    index("username_idx").on(table.username),
  ]
);

export const usersRelations = relations(users_table, ({ many }) => ({
  projects: many(projects_table),
}));

export const projects_table = createTable(
  "projects_table",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement()
      .notNull(),

    ownerId: bigint("ownerId", { mode: "number", unsigned: true }).notNull(),

    name: text("name").notNull(),
    image: text("image"),
    url: text().notNull(),
    healthCheckUrl: text(),
    dbURL: text(),
    dbKey: text(),
    category: text("category").notNull(),
    enabled: boolean("enabled").notNull().default(true),
  },
  (table) => [
    index("owner_idx").on(table.ownerId),
    index("name_idx").on(table.name),
    index("category_idx").on(table.category),
    index("enabled_idx").on(table.enabled),
  ]
);

export const projectsRelations = relations(projects_table, ({ one, many }) => ({
  user: one(users_table, {
    fields: [projects_table.ownerId],
    references: [users_table.id],
  }),
  history: many(history_table),
}));

export const history_table = createTable(
  "history_table",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement()
      .notNull(),

    projectId: bigint("projectId", {
      mode: "number",
      unsigned: true,
    }).notNull(),

    status: text("status").notNull(),
    lastChecked: timestamp("lastChecked").notNull().defaultNow(),
  },
  (table) => [
    index("project_idx").on(table.projectId),
    index("status_idx").on(table.status),
  ]
);

export const historyRelations = relations(history_table, ({ one }) => ({
  project: one(projects_table, {
    fields: [history_table.projectId],
    references: [projects_table.id],
  }),
}));
