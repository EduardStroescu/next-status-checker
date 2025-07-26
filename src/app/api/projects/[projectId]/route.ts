import { getCurrentUserWithRefreshAction } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { history_table, projects_table } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod/v4";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const parsedId = z.coerce.number().safeParse(projectId);
  if (!parsedId.success) {
    return NextResponse.json(
      { error: "No or incorrect projectId provided" },
      { status: 400 }
    );
  }

  try {
    const user = await getCurrentUserWithRefreshAction();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
          eq(projects_table.id, parsedId.data)
        )
      );

    const { project } = rows[0];

    const history = rows
      .filter((row) => row.history !== null)
      .map((row) => row.history);

    const result = {
      ...project,
      history,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
