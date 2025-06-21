"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "./helpers";
import { db } from "../db/drizzle";
import { history_table, projects_table } from "../db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  CreateProject,
  NewLogData,
  Project,
  ProjectsByCategory,
  ProjectWithHistory,
  SafeUser,
  UpdateProject,
} from "../types";
import { revalidatePath } from "next/cache";
import * as z from "zod/v4";
import { SingleStoreRawQueryResult } from "drizzle-orm/singlestore";
import { CustomError } from "../utils";
import {
  getLiveReportForApi,
  getLiveReportForFrontend,
  getLiveReportForSupabase,
  storeLatestStatusResult,
} from "./queries";

type SafeResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string };

const getServerDataSafe = async <T>(
  cb: () => Promise<T>
): Promise<SafeResponse<T>> => {
  try {
    const data = await cb();
    return { success: true, data };
  } catch (error) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error.message as string)
        : String(error);
    return { success: false, message };
  }
};

export const fetchAllProjects = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return await getServerDataSafe(() =>
    db.select().from(projects_table).orderBy(asc(projects_table.name))
  );
};

export const fetchProject = async (projectId: Project["id"]) => {
  const idParse = z.coerce.number().safeParse(projectId);

  if (!idParse.success)
    throw new CustomError("No projectId provided", { statusCode: 400 });

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

    return project;
  });
};

export const fetchProjectWithHistory = async (projectId: Project["id"]) => {
  const idParse = z.coerce.number().safeParse(projectId);

  if (!idParse.success)
    throw new CustomError("No projectId provided", { statusCode: 400 });

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

  return await getServerDataSafe(
    async () => await getLiveReportForAllProjects(user)
  );
};

export const switchProjectStatus = async (
  projectId: Project["id"],
  enabled: boolean
) => {
  const idParse = z.number().safeParse(projectId);
  if (!idParse.success)
    throw new CustomError("No projectId provided", { statusCode: 400 });

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return await getServerDataSafe(async () => {
    await db
      .update(projects_table)
      .set({
        enabled,
      })
      .where(eq(projects_table.id, idParse.data));

    revalidatePath(`/dashboard/${projectId}`);
  });
};

/**
 * Used on the client side with tanstack query, should throw errors.
 */
export const createProjectAction = async (data: CreateProject) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [insertResult] = await db
    .insert(projects_table)
    .values({
      ...data,
      ownerId: user.id,
    })
    .execute();

  if (insertResult.affectedRows === 0)
    throw new CustomError("Could not create project");

  const [project] = await db
    .select()
    .from(projects_table)
    .where(
      and(
        eq(projects_table.ownerId, user.id),
        eq(projects_table.id, insertResult.insertId)
      )
    );

  if (!project) throw new CustomError("Could not create project");
  if (data.enabled) {
    let reportResult: NewLogData | undefined;
    if (data.category === "supabase") {
      reportResult = await getLiveReportForSupabase(project);
    } else if (data.category === "api") {
      reportResult = await getLiveReportForApi(project);
    } else if (data.category === "frontend") {
      reportResult = await getLiveReportForFrontend(project);
    }

    if (reportResult) {
      await storeLatestStatusResult(reportResult);
    }
  }

  revalidatePath("/dashboard");
  return { success: true, data: project };
};

/**
 * Used on the client side with tanstack query, should throw errors.
 */
export const updateProjectAction = async (data: UpdateProject) => {
  const idResult = z.number().safeParse(data.id);
  if (!idResult.success)
    return { success: false, message: "Invalid project ID" };

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  delete data.id;

  const [updateResult] = await db
    .update(projects_table)
    .set(data)
    .where(
      and(
        eq(projects_table.ownerId, user.id),
        eq(projects_table.id, idResult.data)
      )
    );

  if (!updateResult.affectedRows) {
    throw new CustomError("Could not update project");
  }

  if (data.enabled) {
    const [project] = await db
      .select()
      .from(projects_table)
      .where(
        and(
          eq(projects_table.ownerId, user.id),
          eq(projects_table.id, idResult.data)
        )
      );

    if (!project) throw new CustomError("Could not update project");

    let reportResult: NewLogData | undefined;
    if (project.category === "supabase") {
      reportResult = await getLiveReportForSupabase(project);
    } else if (project.category === "api") {
      reportResult = await getLiveReportForApi(project);
    } else if (project.category === "frontend") {
      reportResult = await getLiveReportForFrontend(project);
    }

    if (reportResult) {
      await storeLatestStatusResult(reportResult);
    }
  }

  revalidatePath("/dashboard");
};

/**
 * Used on the client side with tanstack query, should throw errors.
 */
export const deleteProjectAction = async (projectId: Project["id"]) => {
  const idParse = z.coerce.number().safeParse(projectId);

  if (!idParse.success) {
    return { success: false, message: "Invalid project ID" };
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [deleteResult]: SingleStoreRawQueryResult = await db
    .delete(projects_table)
    .where(
      and(
        eq(projects_table.id, idParse.data),
        eq(projects_table.ownerId, user.id)
      )
    );

  if (deleteResult.affectedRows === 0) {
    throw new CustomError("Could not delete project");
  }

  await db
    .delete(history_table)
    .where(eq(history_table.projectId, idParse.data));

  return { success: true };
};

export const refreshIndividualProjectAction = async (
  projectId: Project["id"],
  projectCategory: Project["category"]
) => {
  const idParse = z.coerce.number().safeParse(projectId);

  if (!idParse.success)
    throw new CustomError("No projectId provided", { statusCode: 400 });

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return await getServerDataSafe(async () => {
    const result = await fetchProject(idParse.data);

    if (!result.success)
      throw new CustomError("Project not found", { statusCode: 404 });

    let refreshResult: NewLogData;

    if (projectCategory === "supabase") {
      refreshResult = await getLiveReportForSupabase(result.data);
    } else if (projectCategory === "api") {
      refreshResult = await getLiveReportForApi(result.data);
    } else if (projectCategory === "frontend") {
      refreshResult = await getLiveReportForFrontend(result.data);
    } else {
      throw new CustomError("Invalid project category");
    }

    if (refreshResult) {
      await storeLatestStatusResult(refreshResult);
    }

    revalidatePath("/dashboard");
  });
};
