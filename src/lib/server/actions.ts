"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, getServerDataSafe } from "./helpers";
import { db } from "../db/drizzle";
import { history_table, projects_table } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { CreateProject, NewLogData, Project, UpdateProject } from "../types";
import { revalidatePath } from "next/cache";
import * as z from "zod/v4";
import { SingleStoreRawQueryResult } from "drizzle-orm/singlestore";
import { CustomError } from "../utils";
import {
  fetchProject,
  getLiveReportForApi,
  getLiveReportForFrontend,
  getLiveReportForSupabase,
  storeLatestStatusResult,
} from "./queries";

export const switchProjectStatusAction = async (
  projectId: Project["id"],
  enabled: boolean
) => {
  const idParse = z.number().safeParse(projectId);
  if (!idParse.success)
    throw new CustomError("Invalid project id provided", { statusCode: 400 });

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
    throw new CustomError("Invalid project id provided", { statusCode: 400 });

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
