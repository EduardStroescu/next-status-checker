import "server-only";

import { history_table, projects_table } from "../db/schema";
import { redirect } from "next/navigation";
import { db } from "../db/drizzle";
import { getServerDataSafe } from "./helpers";
import { createClient, PostgrestError } from "@supabase/supabase-js";
import { and, asc, desc, eq } from "drizzle-orm";
import { CustomError } from "../utils";
import * as z from "zod/v4";
import {
  NewLogData,
  Project,
  ProjectsByCategory,
  ProjectWithHistory,
  SafeUser,
} from "../types";
import { getCurrentUser } from "../auth";

export const fetchAllProjects = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return await getServerDataSafe(() =>
    db
      .select({
        id: projects_table.id,
        name: projects_table.name,
        url: projects_table.url,
        category: projects_table.category,
        enabled: projects_table.enabled,
        ownerId: projects_table.ownerId,
      })
      .from(projects_table)
      .orderBy(asc(projects_table.name))
  );
};

export const fetchProject = async (projectId: Project["id"]) => {
  const idParse = z.coerce.number().safeParse(projectId);

  if (!idParse.success)
    throw new CustomError("Invalid project id provided", { statusCode: 400 });

  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  return await getServerDataSafe(async () => {
    const [project] = await db
      .selectDistinct()
      .from(projects_table)
      .where(
        and(
          eq(projects_table.ownerId, user.id),
          eq(projects_table.id, idParse.data)
        )
      );

    if (!project)
      throw new CustomError("Project not found", { statusCode: 404 });

    return project;
  });
};

export const fetchProjectWithHistory = async (projectId: string | number) => {
  const idParse = z.coerce.number().safeParse(projectId);

  if (!idParse.success)
    throw new CustomError("Invalid project id provided", { statusCode: 400 });

  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  return await getServerDataSafe(async () => {
    const rows = await db
      .select({
        project: projects_table,
        history: history_table,
      })
      .from(projects_table)
      .leftJoin(history_table, eq(projects_table.id, history_table.projectId))
      .where(
        and(
          eq(projects_table.ownerId, user.id),
          eq(projects_table.id, idParse.data)
        )
      )
      .orderBy(desc(history_table.lastChecked));

    if (!rows.length)
      throw new CustomError("Project not found", { statusCode: 404 });

    const { project } = rows[0];

    const history = rows
      .map((row) => row.history)
      .filter((h): h is typeof history_table.$inferSelect => h !== null);

    const result = {
      ...project,
      history,
    };

    return result;
  });
};

export const getLiveReportForAllProjects = async (user: SafeUser) => {
  const result = await db
    .select({
      project: projects_table,
      history: history_table,
    })
    .from(projects_table)
    .leftJoin(history_table, eq(projects_table.id, history_table.projectId))
    .where(eq(projects_table.ownerId, user.id))
    .orderBy(asc(projects_table.name), desc(history_table.lastChecked));

  const projectsByCategory: Record<string, ProjectWithHistory[]> = {};

  for (const { project, history } of result) {
    const category = project.category;

    if (!projectsByCategory[category]) {
      projectsByCategory[category] = [];
    }

    const existingProject = projectsByCategory[category].find(
      (p) => p.id === project.id
    );

    if (existingProject) {
      if (history) {
        existingProject.history.push(history);
      }
    } else {
      projectsByCategory[category].push({
        ...project,
        history: history ? [history] : [],
      });
    }
  }

  return projectsByCategory as ProjectsByCategory;
};

export const getAllProjects = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return getServerDataSafe(() => getLiveReportForAllProjects(user));
};

export const storeLatestStatusResult = async (newData: NewLogData) => {
  if (!newData.projectId) {
    throw new CustomError("Project not found", { statusCode: 404 });
  }

  try {
    await db.insert(history_table).values({
      projectId: newData.projectId,
      status: newData.status,
    });
  } catch {
    throw new CustomError("Could not store latest status result", {
      statusCode: 500,
    });
  }
};

// SUPABASE RELATED
export const getLiveReportForSupabase = async (project: Project) => {
  if (!project.dbURL || !project.dbKey) {
    throw new Error("Missing database credentials");
  }

  const result = {
    projectId: project.id,
    name: project.name,
    status: "Inactive",
  };

  try {
    const supabaseClient = createClient(project.dbURL, project.dbKey);
    const { data, error } = (await supabaseClient.rpc("now")) as {
      data: string;
      error: PostgrestError | null;
    };
    if (error) throw new CustomError(error.message, { statusCode: 502 });
    if (!data) throw new CustomError("No data received", { statusCode: 502 });

    result.status = "Active";
  } catch (err: unknown) {
    const error = err as PostgrestError;
    console.error(`❌ Error keeping ${project.name} alive:`, error.message);
  }
  return result;
};

export const refreshLiveReportForAllSupabaseProjects = async (
  userId: number
) => {
  const supabaseProjects = await getProjectsByCategory(userId, "supabase");

  const results = await Promise.all(
    supabaseProjects.map(async (project) => getLiveReportForSupabase(project))
  );

  return results;
};

export const refreshLiveReportForSupabase = async (user: SafeUser) => {
  try {
    const response = await refreshLiveReportForAllSupabaseProjects(user.id);
    return response;
  } catch (err) {
    const error = err as Error;
    throw new CustomError(error.message);
  }
};

// FRONTEND RELATED
export const getLiveReportForFrontend = async (project: Project) => {
  if (!project.healthCheckUrl) throw new Error("Missing frontend URL");

  const result = {
    projectId: project.id,
    name: project.name,
    status: "Inactive",
  };
  try {
    const response = await fetch(project.healthCheckUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    result.status = response.ok ? "Active" : "Inactive";
  } catch (err) {
    console.error(`❌ Error getting status for ${project.name}:`, err);
  }
  return result;
};

export const getLiveReportForAllFrontends = async (userId: number) => {
  const frontendProjects = await getProjectsByCategory(userId, "frontend");

  const results = await Promise.all(
    frontendProjects.map(async (project) => getLiveReportForFrontend(project))
  );

  return results;
};

export const refreshLiveReportForFrontends = async (user: SafeUser) => {
  try {
    const response = await getLiveReportForAllFrontends(user.id);

    return response;
  } catch (err) {
    const error = err as Error;
    throw new Error(error.message);
  }
};

// API RELATED
export const getLiveReportForApi = async (project: Project) => {
  if (!project.healthCheckUrl)
    throw new CustomError("Missing API URL", { statusCode: 400 });

  const result = {
    projectId: project.id,
    name: project.name,
    status: "Inactive",
  };

  try {
    const response = await fetch(project.healthCheckUrl);
    const data = await response.json();
    if (!data || response.status !== 200)
      throw new CustomError("No data received", { statusCode: 502 });

    result.status = "Active";

    return result;
  } catch (err) {
    console.error(`❌ Error getting status for ${project.name}:`, err);
  }
  return result;
};

export const getLiveReportForAllApis = async (userId: number) => {
  const projects = await getProjectsByCategory(userId, "api");

  const results = await Promise.all(
    projects.map(async (project) => getLiveReportForApi(project))
  );

  return results;
};

export const refreshLiveReportForAllApis = async (user: SafeUser) => {
  try {
    const result = await getLiveReportForAllApis(user.id);
    return result;
  } catch (err) {
    const error = err as Error;
    throw new Error(error.message);
  }
};

export const getProjectsByCategory = async (
  userId: number,
  category: Project["category"]
) => {
  try {
    return (await db
      .select()
      .from(projects_table)
      .where(
        and(
          eq(projects_table.ownerId, userId),
          eq(projects_table.category, category),
          eq(projects_table.enabled, true)
        )
      )) as Project[];
  } catch {
    throw new Error(`Could not fetch ${category} projects`);
  }
};

export const getProjectsFromFile = (): Project[] => {
  // const supabaseProjects = JSON.parse(env.SUPABASE_PROJECTS);
  // const apiProjects = JSON.parse(env.API_PROJECTS);
  // const frontendProjects = JSON.parse(env.FRONTEND_PROJECTS);

  // return [...supabaseProjects, ...apiProjects, ...frontendProjects];
  return [];
};

// Function to seed the database with projects for a user.
export const seedProjects = async (userId: number) => {
  const projects = getProjectsFromFile();

  projects.forEach(async (project) => {
    await db.insert(projects_table).values({ ...project, ownerId: userId });
  });
};
