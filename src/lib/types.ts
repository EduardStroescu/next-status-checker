import { history_table, users_table } from "./db/schema";
import { projects_table } from "./db/schema";

export type User = typeof users_table.$inferSelect;
export type SafeUser = Omit<User, "password">;

export type Project = typeof projects_table.$inferSelect;
export type SafeProject = {
  id: Project["id"];
  name: Project["name"];
  url: Project["url"];
  category: Project["category"];
  enabled: Project["enabled"];
  ownerId: Project["ownerId"];
};
export type CreateProject = Omit<typeof projects_table.$inferInsert, "ownerId">;
export type UpdateProject = Partial<typeof projects_table.$inferInsert>;
export type NewLogData = Omit<
  typeof history_table.$inferInsert,
  "id" | "lastChecked"
>;

export type ProjectHistory = {
  id: number;
  status: string;
  lastChecked: Date;
};

export interface ProjectWithHistory extends Project {
  history: ProjectHistory[];
}

export type ProjectsByCategory = {
  [category in Project["category"]]: ProjectWithHistory[];
};
